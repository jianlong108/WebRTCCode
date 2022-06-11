const https = require('https');
const fs = require('fs');
const serverIndex = require('serve-index');
const express = require('express');
const PORT = 3009;
const options = {
	key: fs.readFileSync('./localhost-key.pem'),
	cert: fs.readFileSync('./localhost.pem'),
	port: PORT
};
var app = express();
app.use(serverIndex('./public'));
app.use(express.static('./public'));
app.all("*", function(req,res,next){
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers","DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == 'options') {
    res.send(200);
  } else {
    next();
  }
});
https.createServer(options, app).listen(PORT,'0.0.0.0');

// app.use(express.static('./public'));
// https
// 	.createServer(options, function (req, res) {
// 		console.log(req, res);
// 		// server code
// 		// res.send('xxx');
// 		if (req.url == '/') {
// 			// set response header
// 			res.writeHead(200, {
// 				'Content-Type': 'text/html'
// 			});
// 			// set response content    
// 			res.write('<html><body><p>This is home Page.</p></body></html>');
// 			res.end();

// 		} else if (req.url == "/student") {
// 			res.writeHead(200, {
// 				'Content-Type': 'text/html'
// 			});
// 			res.write('<html><body><p>This is student Page.</p></body></html>');
// 			res.end();
// 		} else if (req.url == "/admin") {
// 			res.writeHead(200, {
// 				'Content-Type': 'text/html'
// 			});
// 			res.write('<html><body><p>This is admin Page.</p></body></html>');
// 			res.end();
// 		} else {
// 			res.end('Invalid Request!');
// 		}
// 	}).listen(PORT);
console.log(`Node.js web server at port ${PORT} is running..`)
