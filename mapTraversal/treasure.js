const {createAxiosLambda} = require('./createAxios.js');
const {sleep} = require('./sleep.js');

const pickup = async (treasureName, player, inventoryExamine, item) => {
  let weight = 0;
  player.inventory.forEach(item => {
    weight += inventoryExamine[item].weight;
  });
  
  while (weight > player.strength){
    let leastImportant = null;
    player.inventory.forEach(item => {
      let examinedItem = {...inventoryExamine[item]};
      if (leastImportant == null || leastImportant.level > examinedItem.level ){
        leastImportant = examinedItem;
      }
    });
    let result = await createAxiosLambda().post('/drop', {name: leastImportant.name});
    console.log(`You have dropped ${leastImportant.name}`);
    let index = player.inventory.findIndex(item => item === leastImportant.name);
    player.inventory.splice(index, 1);
    weight -= leastImportant.weight;
    let wait = await sleep(result.data.cooldown);
  }
  
  if (weight + item.weight <= player.strength){
    return createAxiosLambda().post('take', {"name": treasureName}).then(res => {
      console.log(res.data.messages[0]);
      player.inventory.push(treasureName);
      inventoryExamine[treasureName] = item;
      return res.data
    
    }).catch( e => {
      console.log(e.response.data.errors[0]);
    });
  }else {
    let leastImportant = item;
    player.inventory.forEach(item => {
      if (leastImportant.level > inventoryExamine[item].level){
        leastImportant = inventoryExamine[item]
      }
    });
    
    if (leastImportant.name !== treasureName){
      const result = await createAxiosLambda().post('/drop', {name: leastImportant.name});
      console.log(`You have dropped ${leastImportant.name}`);
      let sleepRes = await sleep(result.data.cooldown)
      return createAxiosLambda().post('/take', {name: treasureName}).then(res => {
        console.log(res.data.messages[0]);
        player.inventory.push(treasureName);
        inventoryExamine[treasureName] = item;
        return res.data;
        
      }).catch(err => {
        return err;
      })
    }else {
      return new Promise(resolve => resolve({cooldown: 0}))
    }
  }
};

const examineItem = (item) => {
  return  createAxiosLambda().post('/examine', {name: item}).then(res => {
    return res.data;
  }).catch(err => {
    return err;
  })
};

const wearItem = (item) => {
  return createAxiosLambda().post('/wear', {name: item}).then(res => {
    return res.data;
  }).catch(err => {
    console.log(err);
    return err;
  })
};

const carrayHeaviestItem = (player, itemsExamined) => {
  let heaviest = null;
  player.inventory.forEach(item => {
    if (heaviest === null || heaviest.weight < itemsExamined[item].weight){
      heaviest = itemsExamined[item]
    }
  });
  
  return createAxiosLambda().post('/carry', {name: heaviest.name})
    .then(res => {
      return res.data;
    }).catch(err => {
      return err;
    })
  
};

const recieveItem = (player, itemsExamined) => {
  
  return createAxiosLambda().post('/carry', {name: heaviest.name})
    .then(res => {
      return res.data;
    }).catch(err => {
      return err;
    })
  
};


module.exports = {
  pickup, examineItem, wearItem
};