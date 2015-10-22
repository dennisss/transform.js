/* Client side script */

var socket = io(),
	tf = require('./lib');



/* http://stackoverflow.com/questions/512528/set-cursor-position-in-html-textbox */


$(function(){

	var adapter = new tf.net.ClientAdapter(socket),
		Foo = new tf.Model('foos', adapter);

	Foo.find(1, function(err, doc){
		doc.subscribe();





	});


	/*
	var Board = transform.Type({

		render: function(){
			if(!this.el){
				this.el = $('<div><h2>Items:</h2><div></div></div>')[0];
			}

			// Causes each of the items in 'arr' to automatically render (and redraw if dirty) into the specified element
			this.mapView(this.data.arr, this.el.children[1]);


			// Setting things using operational transforms
			// this.set({ a: 2 });
		}
	})
	*/


	/*
	var Message = transform.Type({

		map: function(f){
			var arr = this.data.children;

			for(var i = 0; i < arr.length; i++){
				var obj = arr[i]._type_;
				f(obj, i);
			}
		},

		children: function(){
			return this.data.children
		},

		render: function(){
			var el = $('<div><h4>' + this.title + '</h4> <p>' + this.text + '</p></div>');
			return el;
		}

	});
	*/



	return;


	var doc = new transform.Document({ text: '', other: '', arr: [] });
	var value = doc.val();

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




	var view = $('#view')[0];
	doc.bindCollection('arr', view);



	$('#addBtn').on('click', function(){
		doc.push('arr', Message({
			title: '',
			text: ''
		}));
	});

});
