/* Client side script */

var socket = io(),
	transform = require('./lib');



/* http://stackoverflow.com/questions/512528/set-cursor-position-in-html-textbox */


$(function(){

	var doc = new transform.Document({ text: '', other: '' });

	doc.client(socket);


	var text = $('#text')[0];
	var other = $('#other')[0];

	doc.bindInput(text, 'text');
	doc.bindInput(other, 'other');


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
