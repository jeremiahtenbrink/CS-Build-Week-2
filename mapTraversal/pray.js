const {createAxiosLambda} = require("./createAxios.js");

const pray = () => {
  return createAxiosLambda().post('/pray').then(result => {
    return result.data;
  }).catch(err => {
    return err;
  })
}

module.exports = {
  pray
}