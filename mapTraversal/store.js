const {createAxiosLambda} = require("./createAxios.js");
const {sleep} = require('./sleep.js');

const sellTreasure = async (player) => {
  let request = await createAxiosLambda().post('/status');
  player = request.data;
  await sleep(request.data.cooldown);
  while (player.inventory.length > 0){
    let item = player.inventory.pop()
    let result = await createAxiosLambda().post('/sell', {name: item});
    await sleep(result.data.cooldown)
    result = await createAxiosLambda().post('/sell', {name: item, confirm: "yes"});
    console.log(`You have sold ${item}`)
    await sleep(result.data.cooldown)
  }
  let result = await createAxiosLambda().post('/status');
  player = result.data;
  console.log('Finished selling items.');
  console.log(`Your balance is now ${player.gold}`);
  return new Promise(resolve =>  {
    resolve();
  })
};

module.exports = {
  sellTreasure
}