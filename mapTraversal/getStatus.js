const {createAxiosLambda} = require("./createAxios.js");

const getStatus = () => {
  return createAxiosLambda().post('/status').then(res => {
    return res.data;
  }).catch(err => {
    console.log(err.message);
    return err;
  })
};

module.exports = {getStatus}