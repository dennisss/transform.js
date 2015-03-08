'use strict';

var Document = require('./document'),
	Operation = require('./op'),
	Ins = require('./ops/ins'),
	Del = require('./ops/del'),
	Move = require('./ops/move'),
	Set = require('./ops/set'),
	Nop = require('./ops/nop');


/**
 * Compresses a set of suquential operations
 * @param ops an array of operations
 * @return an array of compressed operations
 */
function compress(ops){
	var out = [];

	for(var i = 0; i < ops.length; i++){
		var o = ops[i].clone();
		var next = i < ops.length - 1 ? ops[i+1] : null;


		// Skip invalid or non functional operations
		if(!(o instanceof Operation) || (o instanceof Nop))
			continue;



		if(o instanceof Ins){
			// Filter out empty insertions


			if(next){
				// Compress trivial sequential inserts


			}

		}
		else if(o instanceof Del){
			// Filter out empty deletions

			if(next){
				// Compress trivial sequential inserts

			}

		}




		out.push(o);
	}


	return out;
}

/* Try to compress the array of sequential operations using some simple methods and return the result */
function Compose(ops){
	var res = [];

	for(var i = 0; i < ops.length - 1; i++){
		var cur = ops[i].clone();


		if(cur instanceof Ins){
			// Sequential insertions to the same location or to the i+1'th location can be compressed
			for(var j = i+1; j < ops.length - 1; j++){
				var next = ops[j];
				if(next instanceof Ins){
					if(next.i == cur.i){

					}
					else if(next.i == cur.i + cur.value.length){

					}
					else
						break;
				}
				else
					break;
			}

		}


		if(cur instanceof Del){

		}

		res.push(cur);
	}

	return res;
}


