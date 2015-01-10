'use strict';

module.exports = Pointer;

function Pointer(cont, i){

	this.cont = cont;
	this.i = i;

}

Pointer.prototype = {

	get: function(){
		return this.cont[this.i]
	},

	set: function(v){
		this.cont[this.i] = v;
	}


}
