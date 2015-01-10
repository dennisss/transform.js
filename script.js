/* Client side script */

var socket = io(),
	transform = require('./lib');


/* Quick diffing for the case in which changes will only occur in one location */
function diff(orig, now){

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

/* http://stackoverflow.com/questions/512528/set-cursor-position-in-html-textbox */


$(function(){

	var doc = new transform.Document({ text: '' });

	doc.client(socket);


	var textarea = $('#text');

	var prop = false;

	textarea.on('input', function(){
		if(prop)
			return;

		console.log(doc.value())

		var ops = diff(doc.value().text, textarea.val());

		for(var i = 0; i < ops.length; i++){
			ops[i].p = ['text', ops[i].p];
		}

		console.log(JSON.stringify(ops))

		if(ops.length > 0){
			doc.apply(ops);
		}

	});


	doc.on('change', function(){ // Update the
		var s = textarea[0].selectionStart, e = textarea[0].selectionEnd;

		prop = true;

		textarea.val(doc.value().text);

		prop = false;

		textarea.focus();
		textarea[0].setSelectionRange(s,e);
	});





	var check = $('#onlineMode');

	check.on('click', function(){

		if(check.prop('checked')){
			socket.connect();
		}
		else{
			socket.disconnect();
		}

	})




});
