/**
 * @param {String} roomId
 * @param currentRoom
 * @param map
 */
const getShortestPath = (roomId, currentRoom, map) => {
  const queue = new Queue();
  queue.enqueue(currentRoom);
  let path = {};
  let visited = {};
  while (!queue.isEmpty()){
    let room = queue.dequeue();
    if (room.room_id in visited){
    
    }else {
      visited[room.room_id] = true;
      let directions = room['exits'];
      let found = false;
      Object.keys(directions).forEach(key => {
        let value = directions[key]
        if (value === roomId){
          found = key;
        }
        
      });
      if (found){
        if (path[room.room_id] === undefined){
          path[room.room_id] = []
        }
        path[room.room_id].push(found);
        return path[room.room_id]
      }
      Object.keys(directions).forEach(dir => {
        let newRoomId = room.exits[dir];
        if (newRoomId !== "?"){
  
          let newRoom = map[newRoomId];
  
          if (path[newRoom.room_id] === undefined){
            path[newRoomId] = []
          }
          if (path[room.room_id] !== undefined){
            path[room.room_id].forEach(pathDir => {
              path[newRoom.room_id].push(pathDir);
            });
          }
          path[newRoom.room_id].push(dir);
          queue.enqueue(newRoom);
          
        }
      })
      
    }
  }
  let dir = null;
  while (dir === null){
    let random = Math.ceil( Math.random() * 4);
    try {
      if (random === 1){
        dir = "n"
      }if (random === 2){
        dir = "e"
      }if (random === 3){
        dir = "s"
      }if (random === 4){
        dir = "w"
      }
      
      if (dir !== null){
        return [dir];
      }
    }catch( e ){
    
    }
  }
  
};

class Queue
{
  // Array is used to implement a Queue
  constructor()
  {
    this.items = [];
  }
  // enqueue function
  enqueue(element)
  {
    // adding element to the queue
    this.items.push(element);
  }
  
  dequeue()
  {
    // removing element from the queue
    // returns underflow when called
    // on empty queue
    if(this.isEmpty())
      return "Underflow";
    return this.items.shift();
  }
  
  // isEmpty function
  isEmpty()
  {
    // return true if the queue is empty.
    return this.items.length === 0;
  }
  
}


module.exports = {
  getShortestPath
}