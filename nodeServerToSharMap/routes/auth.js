const router = require("express").Router();

module.exports = (req, res, next) => {
  const uid = req.headers["auth"];
  
  if (uid === "bcff423ac6f6c8b0994654ccf917fb0c1e4699ca"){
    next();
  }else {
    res.status(500).json({message: "You are not allowed to make requests."})
  }
};