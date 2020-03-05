
const {createAxiosLambda, createAxiosServer} = require('./createAxios.js');
const { pickup, examineItem, wearItem } = require( './treasure.js');
const { getShortestPath } = require('./findShortestPath.js');
const { getStatus } = require('./getStatus.js');
const { pray } = require('./pray.js');
const { sellTreasure } = require('./store.js');
const { sleep } = require('./sleep.js');

const playGame = true;
let currentRoom = null;
let player = null;
let map = null;
let requests = [];
let inventoryExamine = {};
let hasShop = true;
let hasName = true;

const startGame = async () => {
  try {
    let mapData = await createAxiosServer().get('/move');
    map = mapData.data;
  }catch(e){
    console.log(e);
  }
  
  let ableToMove = true;
  
  if( currentRoom === null ){
    ableToMove = false;
    let request = createAxiosLambda();
    try{
      let room = await request.get( '/init' );
      if (room.data){
        currentRoom = room.data;
        console.log("Current Room");
        console.log(currentRoom);
        console.log("");
        console.log("");
        if (map[currentRoom.room_id]){
          currentRoom = map[currentRoom.room_id];
        }else {
          currentRoom = {...room.data};
          currentRoom.exits = {};
          room.data.exits.forEach(exit => {
            currentRoom.exits[exit] = "?"
          })
        }
        
        setTimeout(startGame, ((room.data.cooldown * 1000) + 100))
      }else {
        setTimeout(startGame, ((room.data.cooldown * 1000) + 100))
      }
    }catch( e ){
      console.log( e.message );
      console.log(e.response.data.errors[0]);
      console.log("cooldown: " +  e.response.data.cooldown);
      console.log("");
      console.log("");
      setTimeout(startGame, ((e.response.data.cooldown * 1000) + 100)  );
    }
  }
  
  if (player === null && ableToMove === true && currentRoom !== null){
    ableToMove = false;
    let result = await getStatus();
    if (result.response){
      console.log(result.response.data.errors[0])
      setTimeout(startGame, ((result.response.data.cooldown * 1000) + 100) )
    }else {
      player = result;
      console.log("Player:");
      console.log(player);
      console.log("");
      console.log("");
      player.inventory.forEach(item => {
        requests.push({type: "Item", name: item});
      });
      setTimeout(startGame, ((currentRoom.cooldown * 1000) + 100) )
    }
  }
  
  if (ableToMove){
    move()
  }
  
};
let requestCallback = undefined;
const procressRequests = async (callback = undefined) => {
  let cooldown = currentRoom.cooldown;
  if (callback !== undefined){
    requestCallback = callback;
  }
  let callCallback = true;
  let request = requests.shift();
  if (request.type === "treasure"){
    if (hasShop){
      let item = await createAxiosLambda().post('/examine', {name: request.name});
      item = item.data;
      let result = await pickup(request.name, player, inventoryExamine, item);
      if (result.cooldown){
        cooldown = result.cooldown
      }
      
    }else {
      cooldown = 0;
    }
  }else if (request.type === "Item"){
    if (!Object.keys(inventoryExamine).includes(request.name)){
      let result = await examineItem(request.name);
      if (result.cooldown){
        cooldown = result.cooldown
      }
      if (result.name){
        inventoryExamine[result.name] = result;
        console.log(`${result.name}: ` );
        console.log(result);
      }
    }else {
      cooldown = 0;
    }
    
  }else if (request.type === "pray" && hasName){
    let result = await pray();
    console.log(result);
    if (result.cooldown){
      cooldown = result.cooldown;
    }
  }else if (request.type === "sell"){
    
    if (request.length > 0){
      requests.push(request);
      procressRequests();
    }
    callCallback = false;
    requestCallback = move;
    console.log("You are making your way to the shop to sell your treasure.");
    moveToSell(true)
  }
  
  if (requests.length > 0 && callCallback){
    setTimeout(procressRequests, ((cooldown * 1000) + 100))
  }else if(callCallback) {
    setTimeout(requestCallback, ((cooldown * 1000) + 100))
  }
};


const moveToSell = async (start = false) => {
  if (start){
    let path = getShortestPath(1, currentRoom, map);
    moveToShop(path)
  }else {
    if (currentRoom.title === "Shop"){
      let result = await sellTreasure();
      move();
    }else {
      moveToSell(true);
    }
  }
};

let pathToShop = []
const moveToShop = (path = undefined) => {
  if (path !== undefined){
    pathToShop = path;
  }
  
  let dir = pathToShop.shift();
  let exits = currentRoom['exits'];
  
  if (pathToShop.length > 0){
    moveRoom(moveToShop, exits, dir)
  }else {
    moveRoom(moveToSell, exits, dir)
  }
  
};

const move = () => {
  if (requests.length > 0){
    console.log("Starting to process requests.")
    procressRequests(move)
  }else{
  
    let weight = 0;
    player.inventory.forEach(item => {
      weight += inventoryExamine[item].weight;
    });
  
    if ((weight + 3) > player.strength){
      requests.push({type: "sell"})
    }
    
    console.log( "Starting move" );
    let inMap = currentRoom.room_id in map;
    if( !inMap ){
      map[currentRoom.id] = currentRoom
    }
  
    let exits = currentRoom[ 'exits' ];
    let dir = getRandomDir( exits );
    if( dir !== false ){
      moveRoom( move, exits, dir );
    }
  }
};

const getRandomDir = (directions) => {
  let dir = null;
  
  let hasUnexplored = false;
  Object.keys(directions).forEach(exit => {
    if (directions[exit] === "?"){
      hasUnexplored = true;
    }
  });
  
  while (dir === null && hasUnexplored){
    let random = Math.ceil( Math.random() * 4);
    try {
      if (random === 1 && directions['n'] === "?"){
        dir = "n"
      }if (random === 2 && directions['e'] === "?"){
        dir = "e"
      }if (random === 3 && directions['s'] === "?"){
        dir = "s"
      }if (random === 4 && directions['w'] === "?"){
        dir = "w"
      }
      
      if (dir !== null){
        return dir;
      }
    }catch( e ){
    
    }
  }
  console.log("Getting shortest path to unexplored route.");
  let path = getShortestPath("?", currentRoom, map);
  moveTillEmpty(path);
  return false;
};

let pathToMove = [];
const moveTillEmpty = (path = undefined) => {
  if (requests.length > 0 ){
    console.log("Starting to process requests from move till empty.");
    procressRequests(moveTillEmpty)
  }else {
    if (path !== undefined){
      pathToMove = path
    }
  
    let dir = pathToMove.shift();
    let exits = currentRoom['exits'];
  
    if (pathToMove.length > 0){
      moveRoom(moveTillEmpty, exits, dir)
    }else {
      moveRoom(move, exits, dir)
    }
  }
  
};

const moveRoom = async (callback, exits, dir) => {
  
  const data = {
    direction: dir
  };
  if (Object.keys(exits).includes(dir)){
    if (exits[dir] !== "?"){
      data['next_room_id'] = `${exits[dir]}`
    }
  }
  let new_room = createAxiosLambda();
  new_room.post('/move', data)
    .then( async results => {
      // successful move
      let newRoom = results[ 'data' ];
      if (newRoom.room_id !== currentRoom.room_id){
        
  
        console.log( `Moved ${ dir } to room number ${ newRoom.room_id }: ${newRoom.coordinates}` );
        console.log( `${ newRoom.title }` );
        console.log( `${ newRoom.description }` );
  
        if (newRoom.description.includes("shrine")){
          requests.push({type: "pray"})
        }
  
        if (newRoom.items.length > 0){
          newRoom.items.forEach(item => {
            console.log(item);
            requests.push({type: "treasure", name: item})
          })
        }
        if (newRoom.messages.length > 0){
          newRoom.messages.forEach(message => {
            console.log(message);
            if (message.includes("Heavily Encumbered")){
        
            }else if (message.includes("Foolish Explorer")){
              console.log(`Updating the exits for room number ${currentRoom.room_id}`);
              currentRoom.exits[dir] = newRoom.room_id
            }
          })
        }
  
        // request to share data with others
        let post_room = createAxiosServer();
        post_room.post( '/move', {
            prev_room: currentRoom, next_room: newRoom, dir
          } )
          .then(resultsPost => {
            map = resultsPost.data;
      
            currentRoom = {...newRoom}
      
            currentRoom.exits = map[newRoom.room_id].exits;
            
            console.log("Setting timeout");
            console.log(`Time out for: ${currentRoom.cooldown}`);
            console.log(``);
            console.log(``);
            setTimeout(callback, ((currentRoom.cooldown * 1000) + 100))
      
          }).catch(err => {
          console.log( err.message );
          setTimeout(callback, ((currentRoom.cooldown * 1000) + 100))
        })
      }else {
        await sleep(currentRoom.cooldown);
        console.log("Took a wrong turn somewhere.");
        let room = await createAxiosServer().post('/init');
        currentRoom = {...room.data};
        currentRoom.exits = {};
        room.data.exits.forEach(exit => {
          currentRoom.exits[exit] = "?"
        });
        let upodate = createAxiosServer().put('/', currentRoom);
        console.log(`Updated the server exits for room number ${currentRoom.room_id}`);
        await sleep(currentRoom.cooldown)
        move()
      }
      
    }
  ).catch(err => {
    let cooldown = currentRoom.cooldown;
    console.log(err.message);
    if (err.response && err.response.data){
      console.log(err.response.data.errors[0])
      if (err.response.data.cooldown){
        cooldown = err.response.data.cooldown;
      }
      if (err.response.data.cooldown > 60){
        process.exit()
      }
    }
    setTimeout(callback,((cooldown * 1000) + 100))
  })
};

startGame()