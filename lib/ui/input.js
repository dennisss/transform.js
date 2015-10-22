'use strict';

var Document = require('../document'),
	Path = require('../path');


/* Quick diffing for the case in which changes will only occur in one location */
function lindiff(orig, now){

	var is = 0, js = 0, ie = orig.length - 1, je = now.length - 1;

	while(is < orig.length && js < now.length){
		if(orig.charAt(is) != now.charAt(js)){
			break;
		}

		is++;
		js++;
	}

	if(is == orig.length && js == now.length){ // The strings are equal
		return [];
	}


	while(ie >= is && je >= js){
		if(orig.charAt(ie) != now.charAt(je)){
			break;
		}

		ie--;
		je--;
	}


	var del = orig.slice(is, ie + 1);
	var ins = now.slice(js, je + 1);


	var ops = [];

	if(del){
		ops.push({d: del.length, p: is})
	}


	if(ins){
		ops.push({i: ins, p: is});
	}

	return ops;
}


/* Basic interpreting of paths like "this.hello[0].jello" */
var reg = /(\[[^\.]+\])|[^\.\[\]]+/g;
function parse_jspath(s){
	var parts = s.match(reg);
	var p = [];

	for(var i = 0; i < parts.length; i++){
		var v = parts[i];

		if(v.charAt(0) == '[')
			p.push(parseInt(v.substr(1, v.length - 2)));
		else
			p.push(v);
	}

	return p;
}
Document.parse_jspath = parse_jspath;

/**
 * Bi-directionally bind an HTML Input element to a value in the document
 *
 * @param el an element with a 'value' property and 'input' event
 * @param p a path specifier that indicates where to bind the input
 */
Document.prototype.bindInput = function(el, p){
	if(typeof(p) == 'string'){
		p = parse_jspath(p);
	}

	p = new Path(p);

	var self = this;


	var prop = false;


	var $el = $(el);

	$el.on('input', function(){
		if(prop)
			return;


		// TODO: Check if key value exists in document, else create it

		var ops = lindiff( p.get( self.val() ), $el.val());


		for(var i = 0; i < ops.length; i++){
			ops[i].p = p.p.concat(ops[i].p); // ['text', ops[i].p];
		}

		console.log(JSON.stringify(ops))

		if(ops.length > 0){
			self.apply(ops);
		}

	});

	this.on('change', function(){

		var s = el.selectionStart, e = el.selectionEnd;

		prop = true;

		$el.val(p.get( self.val() ));

		prop = false;

		$el.focus();
		el.setSelectionRange(s,e);

	});

}
