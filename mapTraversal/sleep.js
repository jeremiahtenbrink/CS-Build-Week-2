function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, ((s * 1000) + 100)));
}

module.exports = {
  sleep
}