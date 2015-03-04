var gulp = require('gulp'),
	browserify = require('gulp-browserify'),
	concat = require('gulp-concat'),
	jsdoc = require('gulp-jsdoc');



gulp.task('watch', function(){
	var watcher = gulp.watch(['**/*.js'], ['build', 'server']);

	watcher.on('change', function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
})

gulp.task('doc', function(){
	return gulp.src(["./lib/**/*.js", "README.md"])
	.pipe(jsdoc('./doc/out'))
});

gulp.task('build', function() {
	gulp.src('./script.js', { read: false })
	.pipe(browserify({
		debug: true
	}))
	.pipe(concat('app.js'))
	.pipe(gulp.dest('./public/build'))
});

var server = null;

function runServer(env){
	function start(){
		console.log('Starting server')
		server = require('child_process').spawn('node', ['server.js'], {
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
