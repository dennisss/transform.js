'use strict';

/**
 * Creates a server that can work with a socket.io namespace to manage requesters from clients
 * Given a set of Models and a socket server, the server will listen for commands
 */
class Server {

	constructor(models){
		this.mmap = {};
		for(var i = 0; i < models.length; i++){
			this.mmap[models[i].name] = models[i];
		}
	};


	connect(sock){
		// TODO: Most of these require that the Document be reloaded from the Model

		sock.on('subscribe', function(data){
			// TODO: Make sure that the user can access this document
			// TODO: Also make sure that the document actually exists

			// Subscribe to a document identified by it's id and model
			// The client will be put into a room to receive changes
			sock.join(data.id);

			// io.to('some room').emit('some event'):
		});

		sock.on('unsubscribe', function(data){
			sock.leave(data.id);
		});


		sock.on('history', function(data){



			// Retrieve the specified part of the documents history and send it back to the client



		});


		sock.on('create', function(data){
			// Make a new document in the model

		});

		sock.on('read', function(data){

		});


		/*
		Data should be of the form:
		{
			model: '',
			id: '',

			v: 1, // The version that the operations apply to
			ops: [...]
		}
	*/
		sock.on('update', function(data){
			// Handle operations that are being applied to a document

			var model = this.mmap[i];

			if(!model){
				// Failure
			}

			model.find(data.id, function(err, doc){

				// TODO: Error check and make sure that the document was found

				var curv = doc.v;
				var transformed = doc.apply(data.ops, data.v);


				// This should contact the adapter and persist the changes
				doc.commit(function(err){

					sock.emit('ack', {v: curv}); // Let the client know at which version the changes were applied

					// TODO: Change this to broadcast to the room
					// TODO: What if this is received by the current client before the 'ack'
					sock.broadcast.emit('change', {ops: transformed, v: curv});

				});


			});
		})



	}





};

module.exports = Server;
