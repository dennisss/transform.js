var gulp = require('gulp'),
	browserify = require('browserify'),
	es6ify = require('es6ify'),
	fs = require('fs'),
	concat = require('gulp-concat'),
	jsdoc = require('gulp-jsdoc');



gulp.task('watch', function(){
	var watcher = gulp.watch(['./lib/**/*.js', './src/**/*.js'], ['build', 'server']);

	watcher.on('change', function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
})

gulp.task('doc', function(){
	return gulp.src(["./lib/**/*.js", "README.md"])
	.pipe(jsdoc('./doc/out'))
});

gulp.task('build', function() {

	return browserify({ debug: true })
	.add(es6ify.runtime)
	.transform(es6ify)
	.require(require.resolve('./script.js'), { entry: true })
	.bundle()
	.pipe(fs.createWriteStream('./public/build/app.js'));

});

var server = null;

function runServer(env){
	function start(){
		console.log('Starting server')
		server = require('child_process').spawn('node', ['./src/server.js'], {
			stdio: ['ignore', 1, 2]
		})

		server.on('exit', function(code, signal){
			console.log('Server exited.')
			start();
		})

	}


	if(server){
		console.log('Stopping server')
		server.kill('SIGINT')
		return;
	}
	else{
		start();
	}


}

process.on('exit', function(){
	if(server != null){
		console.log('Killing server')
		server.kill('SIGINT');
	}
})


gulp.task('server', function(){
	runServer();
});



gulp.task('default', ['build', 'watch', 'server'])
