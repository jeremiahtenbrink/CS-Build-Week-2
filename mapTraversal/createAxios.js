const axios  = require( 'axios');

const createAxiosLambda = () => {
  return axios.create({
    baseURL: 'https://lambda-treasure-hunt.herokuapp.com/api/adv',
    timeout: 1000,
    headers: {'Authorization': "Token bcff423ac6f6c8b0994654ccf917fb0c1e4699ca"}
  })
};

const createAxiosServer = () => {
  return axios.create({
    baseURL: 'https://cs-build-week2.herokuapp.com',
    headers: {"auth": "bcff423ac6f6c8b0994654ccf917fb0c1e4699ca"}
  })
};

module.exports = {
  createAxiosLambda,
  createAxiosServer
}