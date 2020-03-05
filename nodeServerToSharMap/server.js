const express = require( "express" );
const cors = require( "cors" );
const helmet = require( "helmet" );
const move = require('./routes/move.js');
const path = require( "path" );
const bodyParser = require( "body-parser" );

const server = express();

const apiDocsPath = path.join( __dirname, "/apidoc");

server.use( helmet() );
server.use( cors() );
server.use( express.json() );
server.use( bodyParser.urlencoded( { extended: true } ) );




server.use('/move',  move);


server.use("/api", (req, res) => {
  console.log("inside of server up message");
  return res.status(200).json({ message: "Server up and running" });
});
server.use( "/", express.static( apiDocsPath ) );

module.exports = server;
