'use strict'

var log4js = require('log4js');
var https = require('https');
var fs = require('fs');

var socketIo = require('socket.io');
var express = require('express');

var serveIndex = require('serve-index');

var USERCOUNT = 3; 

log4js.configure({
    appenders: {
        file: {
            type:'file',
            filename:'app.log',
            layout: {
                type:'pattern',
                pattern:'%r %p - %m',
            }
        }
    },
    categories: {
        default:{
            appenders:['file'],
            level:'debug'
        }
    }
})

var logger = log4js.getLogger();
var app = express();
app.use(serverIndex('./public'));
app.use(express.static('./public'));
app.all("*", function(req,res,next){
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods","content-type");
  res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == 'options') {
    res.send(200);
  } else {
    next();
  }
});

const options = {
	key: fs.readFileSync('./localhost-key.pem'),
	cert: fs.readFileSync('./localhost.pem'),
	port: PORT
};
var httpsSever = https.createServer(options, app).listen(PORT,'0.0.0.0');
var io = socketIo.listen(httpsSever);

io.sockets.on('connection',(socket)=> {
    socket.on('message', (room, data)=> {
        logger.debug('message ,room: ' + room + ",data ,type:" + data.type);
        socket.to(room).emit('message',room,data);
    });

    socket.on('join', (room)=> {
        socket.join(room);
        var myroom = io.sockets.adapter.rooms[room];
        var users = (myroom)?Object.keys(myroom.sockets).length : 0;

        logger.debug('the user number of room (' + room + ") is:" + users);
        if (users < USERCOUNT) {
            socket.emit('joined',room,socket.id);

            if (users > 1) {
                socket.to(room).emit('other_join',room,socket.id);
            }
        } else {
            socket.leave(room);
            socket.emit('full',room,socket.id);
        }
    });

    socket.on('leave', (room)=> {

        socket.leave(room);
        var myroom = io.sockets.adapter.rooms[room];
        var users = (myroom)?Object.keys(myroom.sockets).length : 0;

        logger.debug('the user number of room is ' + users);
        
        socket.to(room).emit('bye',room,socket.id);
        socket.emit('left',room,socket.id);
    });
})

httpsSever.listen(3009,'0.0.0.0');