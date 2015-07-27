var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var coffee = require('gulp-coffee');

gulp.task('sass', function() {
  	return sass('app/sass/style.sass')
    	.pipe(gulp.dest('app/css'))
    	.pipe(reload({ stream:true }));
});

gulp.task('coffee', function() {
  gulp.src('app/coffee/*.coffee')
    .pipe(coffee({bare: true})).on('error', console.log)
    .pipe(gulp.dest('app/js'))
    .pipe(reload({ stream:true }));
});

// watch Sass files for changes, run the Sass preprocessor with the 'sass' task and reload
gulp.task('serve', ['sass', 'coffee'], function() {
  	browserSync({
    	server: {
      		baseDir: 'app'
    	}
  	});

	gulp.watch(['*.html'], {cwd: 'app'}, reload);
	gulp.watch('app/sass/*.sass', ['sass']);
  gulp.watch('app/coffee/*.coffee', ['coffee']);
});



