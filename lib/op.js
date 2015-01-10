'use strict';

/* Base class for operations */

module.exports = Operation;

/*
	op.v is the version that is the context version of the operation

	i.e
	the version of the empty document is v = 0

	the very first of all operations in the history will operate on the empty document and will have the form {v: 0, ...}
		-> this command will make the document v = 1

	so the next operation will be of the form {v: 1, ...} indicating that it works after the first


	when operations are ack'ed by the server, it will return a list of the op.v's that it has assigned to the operations. If the v's sent agree with the v's received,
	then the operations can be safely added to the history, otherwise, it means that there are other external operations that got commited before the ones sent by the current client

*/

function Operation(ctx){

	this.v = 0; // A non-true version is used to indicate a local non-commited operation
//	this.ctx = ctx;
}

/*
	Operations need to implement:
	.inv() -> get the inverse operation
	.clone() -> get an identical clone of the operation
	.exec(data) -> runs the operation on the data and returns the result

*/

/* Total ordering relation: undefined between pairs of local only changes*/
Operation.prototype.before = function(other){
	if(!other.v)
		return true;

	return this.v < other.v;
}

Operation.prototype.after = function(other){
	return !this.before(other); // It must be guranteed that no two operations ever happen at the same time
}



Operation.prototype.include = function(other){
	var self = this.clone();

	if(!(other instanceof Array))
		other = [other];


	for(var i = 0; i < other.length; i++){
		self = other[i].includer(self);
	}

	return self;

}

/* Given an operation (or an array of operations) invert them  */
function Inv(op){
	if(op instanceof Array){
		var ops = [];
		for(var i = 0; i < op.length; i++){
			ops.push(Inv(op[i]));
		}
		return ops;
	}

	return op.inv();
}



Operation.prototype.exclude = function(other){
	// include the inverse of everything in other

	return this.include(Inv(other));
}
