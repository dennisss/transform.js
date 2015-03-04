'use strict';

var util = require('util'),
	Operation = require('../op');

module.exports = Nop;

/**
 * @class Nop
 * @classdesc Does nothing
 **/
function Nop(){ if(!(this instanceof Nop)){ return new Nop(); } }
util.inherits(Nop, Operation);

Nop.prototype.inv = function(){ return new Nop(); }
Nop.prototype.exec = function(data){ return data; }
Nop.prototype.clone = function(){ return Nop(); }
Nop.prototype.toJSON = function(){ return null; }
