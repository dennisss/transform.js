'use strict';

var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	tf = require('./lib');

app.use(express.static(__dirname + '/public'));

// Define the datastore and a model
var adapter = new tf.Adapter.Memory(),
	Foo = new tf.Model('foos', adapter);

var server = new tf.net.Server([Foo]);



io.on('connection', function(socket){
	console.log('a user connected');


	// Here the app should verify the user_id of the socket connection


	server.connect(socket);




	/*
	// Create a new document in some collection
	socket.on('create', function(data){


	});

	// Get parts of the history
	socket.on('history', function(data){
		socket.emit({ops: doc.history.slice(data.f, data.t), v: data.f})

	})

	// Receive operations to update a document and
	socket.on('update', function(data){
		// TODO: Try, catch this and make sure that the change is transactional

		console.log("UP")


		var curv = doc.v;
		var transformed = doc.apply(data.ops, data.v);


		// TODO: If committing to a database, it will be much more complicated

		doc.commit();

		console.log('UPDATE BROADCAST')

		socket.emit('ack', {v: curv});
		socket.broadcast.emit('change', {ops: transformed, v: curv});

	})

	socket.on('delete', function(data){


	})

	*/

});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
