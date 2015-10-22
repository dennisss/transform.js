'use strict';

var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	Operation = require('./op'),
	Ins = require('./ops/ins'),
	Del = require('./ops/del'),
	Move = require('./ops/move'),
	Set = require('./ops/set'),
	Nop = require('./ops/nop');

module.exports = Document;

/*
	A document represents a editable peice of data
	Generic JSON objects are supported: plain strings, numbers, arrays, objects, or any subset of JSON can be used as the root.
*/

/*
	Notes:

	Clients must get an ack of their last sent set of operations prior to sending more
	There will be a single scalar value representing the version of the document, only the server will be able to increment this
	The version vector is continuous, once a client has received an ack of their last sent operations, they should make sure that their history has all external changes
		integrated before sending more operations


*/

/**
 * @classdesc A version controlled object holder
 * @class Document
 * @extends EventEmitter
 * @param {object} data the inital data
 * @param {int} v the starting version
 * @example
 * var doc = new Document({a: [1,4,5,6], b: [1,2,3,4,5]}, 0);
 */
function Document(data, v){

	this.data = data;
	this.v = v || 0;


	this.history = [];


	// TODO: Some of these things should be initialized by the adapter?
	// But, regardless of the adapter, it is still important to know which things are local

	this._acked = true; // Whether or not the pending local changes have been acknowledged by the server
	this._lock = false;

	this.pending = 0; // Number of operations waiting to be acknowledged
	this.local = []; // Future changes (those performed locally, but not synchronized with a server)

	this.packets = {}; // A table of operations received from the server: keys are the version they apply to and values are the operations
	this.latest = 0; // The version of the newest peice of data received from the server


}
util.inherits(Document, EventEmitter);

Document.prototype.value = function(){
	return this.data;
}

/**
 * Retrieves the current value of the document
 */
Document.prototype.val = function(){
	return this.value();
}

/**
 * Register a cursor that will be updated with document changes
 */
Document.prototype.bindCursor = function(c){

}

/**
 * Unregister a cursor registered with bindCursor
 */
Document.prototype.unbindCursor = function(c){

}



/*
*/



/**
 * Listen for remote events/changes to this document
 */
Document.prototype.subscribe = function(){
	this.model.adapter.subscribe(this);
}

/**
 * Stop listening for remote events
 */
Document.prototype.unsubscribe = function(){
	this.model.adapter.unsubscribe(this);
}


/**
 * Saves the document back into the Model from which it was retrieved
 *
 * @param callback called when the process is done
 */
Document.prototype.save = function(callback){
	this.model.adapter.update(callback);
}





Document.prototype._submit = function(){

}

/* Wait for all local operations to sync with the server */
Document.prototype.flush = function(callback){

}


// Upgrade ops based on the preceding diff operations that split their contexts from the current document context
function Upgrade(ops, diff){

	var exc = []; // List of the previous operations to first exclude (these are the non-transformed ones)
	var inc = []; // List of the previous operations to then include (these are the transformed ones)
	for(var i = 0; i < ops.length; i++){
		var o = ops[i];

		var ot = o.exclude(exc);
			ot = ot.include(diff),
			ot = ot.include(inc);

		exc.splice(0, 0, o);
		inc.push(ot);
	}

	return inc;
}

/*
	Apply local changes to a version of the document (or the current version if no version specified)
	If multiple operates are specified, then they are assummed to be casually preceding each other

	//Apply an operation (or an array or operations) to the current version of document
	//Operations will also be queued to be synced with the server
*/
Document.prototype.apply = function(op, v){
	if(!(op instanceof Array))
		op = [op];

	if(op.length == 0)
		return;

	// Parsing
	op = op.slice();
	for(var i = 0; i < op.length; i++){
		var o = op[i];
		if(!(o instanceof Operation)){ // Parse it
			if(o == null){
				op[i] = Nop();
			}
			else if(o.d){
				op[i] = Del(o.p, o.d);
			}
			else if(o.i){
				op[i] = Ins(o.p, o.i);
			}
			else if(o.m){
				op[i] =	Move(o.f, o.t, o.m);
			}
			else if(o.s){
				op[i] = Set(o.p, o.s);
			}
		}
	}

	// Case: All the changes are on the current version
	if(arguments.length == 1 ){
		for(var i = 0; i < op.length; i++){
			this.data = op[i].exec(this.data);
			this.local.push(op[i]);
		}

// try to send to server
//		this._trysend();

		return;
	}


	// Undo local
	for(var i = this.local.length - 1; i >= 0; i--){
		this.data = this.local[i].inv().exec(this.data);
	}



	// Upgrade the context of the new operations
	if(v < this.v){
		var ctxDiff = this.history.slice(v); // Get all the commands since the specified version
		op = Upgrade(op, ctxDiff);
	}

	// TODO: Make sure that the operations were upgraded enough : in the case of missing operations, the history may have been incomplete


	// Transform the undone commands
	this.local = op.concat( Upgrade(this.local, op) );


	// Do and Redo
	for(var i = 0; i < this.local.length; i++){
		this.data = this.local[i].exec(this.data);
	}

// try to send to server
//	this._trysend();

	return op;
}



// Client side message processing
Document.prototype._process = function(){
	if(!this._acked){ // Have data pending for which an ack wasn't received, after some time try resending it and either receiving an ordinary ack or a notice that it was already sent


		return;
	}

	// Process any packets that were received
	while(this.packets[this.v]){
		var p = this.packets[this.v];

		if(p == 'local'){ // The changes to this version are the local ones
			this.commit(this._pending);
			this._pending = 0;
			this._lock = false;
		}
		else{
			this.apply(p, this.v);
			this.commit(p.length);
		}

		delete this.packets[this.v];
	}

	if(this.v < this.latest){ // We seen to be missing stuff

	}
	else{
		this._trysend();
	}

}

/**
 * Upgrade the history of the document using n local changes (omit to use them all)
 * This is a private function and should only be used by a server or if you know what you are doing
 */
Document.prototype.commit = function(n){
	var bound = this.local.length;
	if(arguments.length == 0 || n > bound){
		n = bound;
	}

	for(var i = 0; i < n; i++){
		this.history.push(this.local.shift());
	}

	this.v += n;
}
