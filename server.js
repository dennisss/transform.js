'use strict';

var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	transform = require('./lib');

app.use(express.static(__dirname + '/public'));


var doc = new transform.Document('');

io.on('connection', function(socket){
	console.log('a user connected');

	socket.on('read', function(){
		socket.emit('value', { data: doc.value(), v: doc.v });
		socket.ver = doc.v; // Used to detect resent operations: the same socket should never send multiple sets of operations relating to the same version
	})

	// Get parts of the history
	socket.on('get', function(data){
		socket.emit({ops: doc.history.slice(data.f, data.t), v: data.f})

	})

	socket.on('update', function(data){
		var curv = doc.v;
		var transformed = doc.apply(data.ops, data.v);

		doc.commit();

		console.log('UPDATE BROADCAST')

		socket.emit('ack', {v: curv});
		socket.broadcast.emit('change', {ops: transformed, v: curv});

	})

});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
