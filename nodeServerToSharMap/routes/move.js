const router = require("express").Router();
const db = require("../data/dbConfig.js");
const auth = require('./auth.js');

/**
 * @api {get} /move     Gets the map
 * @apiVersion 1.0.0
 * @apiName GetMap
 * @apiGroup Map
 *
 *
 * @apiExample Request example:
 * const request = axios.create({
 *     baseURL: 'http://localhost:5000/',
        timeout: 1000,
 * });
 * request.get('/move');
 *
 * @apiUse Error
 *
 * @apiSuccessExample Map
 *
 {  "4": {
        "room_id": 4,
        "title": "A misty room",
        "terrain": "NORMAL",
        "elevation": "0",
        "description": "You are standing on grass and surrounded by a dense mist. You can barely make out the exits in any direction.",
        "coordinates": "(61,60)",
        "items": "{}",
        "exits": {
            "n": 23,
            "e": 13,
            "w": "?"
        },
        "messages": null
    }, "13": {
        "room_id": 13,
        "title": "A misty room",
        "terrain": "NORMAL",
        "elevation": "0",
        "description": "You are standing on grass and surrounded by a dense mist. You can barely make out the exits in any direction.",
        "coordinates": "(62,60)",
        "items": "{}",
        "exits": {
            "e": 15,
            "w": 4
        },
        "messages": null
    },
 
 }
 *
 */
router.get('/', async (req, res) => {
  const map = await getMap();
  res.status(200).json(map);
});

/**
 * @api {get} /move/title     Gets the map with titles as the keys
 * @apiVersion 1.0.0
 * @apiName GetMapTitle
 * @apiGroup Map
 *
 *
 * @apiExample Request example:
 * const request = axios.create({
 *     baseURL: 'http://localhost:5000/',
        timeout: 1000,
 * });
 * request.get('/title');
 *
 * @apiUse Error
 *
 * @apiSuccessExample Map
 *
 {  "A misty room": {
        "room_id": 4,
        "title": "A misty room",
        "terrain": "NORMAL",
        "elevation": "0",
        "description": "You are standing on grass and surrounded by a dense mist. You can barely make out the exits in any direction.",
        "coordinates": "(61,60)",
        "items": "{}",
        "exits": {
            "n": 23,
            "e": 13,
            "w": "?"
        },
        "messages": null
    }, "A misty room": {
        "room_id": 13,
        "title": "A misty room",
        "terrain": "NORMAL",
        "elevation": "0",
        "description": "You are standing on grass and surrounded by a dense mist. You can barely make out the exits in any direction.",
        "coordinates": "(62,60)",
        "items": "{}",
        "exits": {
            "e": 15,
            "w": 4
        },
        "messages": null
    },
 
 }
 *
 */
router.get('/title', async (req, res) => {
  const map = await getMap();
  const mapTitle = {};
  Object.keys(map).forEach(key => {
    mapTitle[map[key].title + " " + map[key].room_id] = map[key];
  });
  mapTitle["1"] = Object.keys(mapTitle).length;
  res.status(200).json(mapTitle);
});

/**
 * @api {get} /move/shop     Gets the map with titles as the keys
 * @apiVersion 1.0.0
 * @apiName GetRoomNumberOfTheShop
 * @apiGroup Map
 *
 *
 * @apiExample Request example:
 * const request = axios.create({
 *     baseURL: 'http://localhost:5000/',
        timeout: 1000,
 * });
 * request.get('/title');
 *
 * @apiUse Error
 *
 * @apiSuccessExample Map
 *
 {
        "room_id": 5,
        "title": "shop",
        "terrain": "NORMAL",
        "elevation": "0",
        "description": "You are standing on grass and surrounded by a dense mist. You can barely make out the exits in any direction.",
        "coordinates": "(61,60)",
        "items": "{}",
        "exits": {
            "n": 23,
            "e": 13,
            "w": "?"
        },
        "messages": null
  },
 
 *
 */
router.get('/shop', async (req, res) => {
  const map = await getMap();
  let mapShop = {};
  Object.keys(map).forEach(key => {
    if (map[key].title === "shop"){
      mapShop = map[key]
    }
  });
  
  res.status(200).json(mapShop);
});

const getMap = async () => {
  const rooms = await db('rooms');
  const map = {};
  rooms.forEach(room => {
    room.exits = JSON.parse(room.exits);
    try {
      room.items = JSON.parse(room.items);
    }catch (e){
      room.items = [];
    }
    
    map[room.room_id] = room;
  });
  return map;
};

/**
 * @api {post} /move     Post new route to the server
 * @apiVersion 1.0.0
 * @apiName PostRoute
 * @apiGroup Move
 *
 * @apiParam {String} dir The direction you moved from the prev to the next.
 * @apiParam {Object} prev_room The room you moved out of.
 * @apiParam {Object} next_room The room you moved into.
 *
 * @apiExample Request example:
 * const request = axios.create({
 *     baseURL: 'http://localhost:5000/',
        timeout: 1000,
 * });
 * request.post('/move', {
 *   dir: "n",
 *   prev_room: {room_id: "1" ...},
 *   new_room: {room_id: "2" ...}
 * });
 *
 * @apiUse Error
 *
 * @apiSuccessExample Updated map
 *{  "4": {
        "room_id": 4,
        "title": "A misty room",
        "terrain": "NORMAL",
        "elevation": "0",
        "description": "You are standing on grass and surrounded by a dense mist. You can barely make out the exits in any direction.",
        "coordinates": "(61,60)",
        "items": "{}",
        "exits": {
            "n": 23,
            "e": 13,
            "w": "?"
        },
        "messages": null
    }, "13": {
        "room_id": 13,
        "title": "A misty room",
        "terrain": "NORMAL",
        "elevation": "0",
        "description": "You are standing on grass and surrounded by a dense mist. You can barely make out the exits in any direction.",
        "coordinates": "(62,60)",
        "items": "{}",
        "exits": {
            "e": 15,
            "w": 4
        },
        "messages": null
    },
 
 }
 *
 *
 */
router.post('/', auth,  async (req, res) => {
  const {dir, prev_room, next_room} = req.body;
  
  let prev = await db('rooms').where({room_id: prev_room.room_id}).first();
  let next = await db('rooms').where({room_id: next_room.room_id}).first();
  
  delete(prev_room['players']);
  delete(prev_room['cooldown']);
  delete(prev_room['errors']);
  delete(prev_room['messages']);
  
  delete(next_room['players']);
  delete(next_room['cooldown']);
  delete(next_room['errors']);
  delete(next_room['messages']);
  
  next_room['items'] = JSON.stringify(next_room['items']);
  prev_room['items'] = JSON.stringify(prev_room['items']);
  
  if (prev){
    prev.exits = JSON.parse(prev.exits)
  }else {
    prev = await makeRoom(prev_room);
    prev = prev[0];
    prev.exits = JSON.parse(prev.exits);
  }
  if (next){
    next.exits = JSON.parse(next.exits)
  }else {
    next = await makeRoom(next_room);
    next = next[0];
    next.exits = JSON.parse(next.exits);
  }
  
  prev.exits[dir] = next.room_id;
  let revDirection = getReverseDirection(dir);
  next.exits[revDirection] = prev.room_id;
  let resultNext = await updateRoom(next);
  let resultPrev = await updateRoom(prev);
  
  const map = await getMap();
  res.status(201).json(map)
});

/**
 * @api {put} /move     Update room
 * @apiVersion 1.0.0
 * @apiName UpdateRoom
 * @apiGroup Move
 *
 * @apiParam {Object} room The room you moved out of.
 *
 * @apiExample Request example:
 * const request = axios.create({
 *     baseURL: 'http://localhost:5000/',
        timeout: 1000,
 * });
 * request.put('/', {
 *   dir: "n",
 *   prev_room: {room_id: "1" ...},
 *   new_room: {room_id: "2" ...}
 * });
 *
 * @apiUse Error
 *
 * @apiSuccessExample Updated map
 *{  "4": {
        "room_id": 4,
        "title": "A misty room",
        "terrain": "NORMAL",
        "elevation": "0",
        "description": "You are standing on grass and surrounded by a dense mist. You can barely make out the exits in any direction.",
        "coordinates": "(61,60)",
        "items": "{}",
        "exits": {
            "n": "?",
            "e": 13,
            "w": "?"
        },
        "messages": null
    }
 
 }
 *
 *
 */
router.put('/',auth,  async (req, res) => {
  const {room} = req.body;
  try {
    let result = await db("rooms").update(room);
    if (result === 1){
      let room = await db('rooms').select("*").where({room_id: room.room_id});
      res.status(200).json(room);
    }else {
      res.status(500).json({message: "Update failed."})
    }
  }catch( e ){
    res.status(500).json({message: e.message})
  }
  
});


const getReverseDirection= (dir) => {
  let directions = {
    n: "s",
    s: "n",
    e: "w",
    w: "e"
  };
  return directions[dir];
};

const updateRoom = (room) => {
  room.exits = JSON.stringify(room.exits);
  return db('rooms').where({room_id: room.room_id}).update(room)
};

const makeRoom = (room) => {
  if (Array.isArray(room.exits)){
    let exitOb = {};
    room.exits.forEach(exit => {
      exitOb[exit] = "?"
    });
    room.exits = exitOb;
  }
  room.exits = JSON.stringify(room.exits);
  return db('rooms').insert(room).returning('*')
  
};

module.exports = router;