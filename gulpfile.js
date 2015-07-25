var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('sass', function() {
  	return sass('app/sass/style.sass')
    	.pipe(gulp.dest('app/css'))
    	.pipe(reload({ stream:true }));
});

// watch Sass files for changes, run the Sass preprocessor with the 'sass' task and reload
gulp.task('serve', ['sass'], function() {
  	browserSync({
    	server: {
      		baseDir: 'app'
    	}
  	});

	gulp.watch(['*.html', 'app/script/**/*.js'], {cwd: 'app'}, reload);
	gulp.watch('app/sass/*.sass', ['sass']);
});