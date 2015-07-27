var gulp = require('gulp');
    concat = require('gulp-concat'),
    sass = require('gulp-ruby-sass'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    coffee = require('gulp-coffee'),
    ghPages = require('gulp-gh-pages');
 
gulp.task('deploy', function() {
  return gulp.src('app/dist/**/*')
    .pipe(ghPages());
});

gulp.task('sass', function() {
  	return sass('app/sass/style.sass')
    	.pipe(gulp.dest('app/dist/css'))
    	.pipe(reload({ stream:true }));
});

gulp.task('coffee', function() {
    gulp.src('app/coffee/*.coffee')
        .pipe(coffee({bare: true}))
        .on('error', console.log)
        .pipe(gulp.dest('app/dist/js'))
        .pipe(reload({ stream:true }));
});

gulp.task('vendor', function() {
    gulp.src('app/js/*.js')
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('app/dist/js'))
        .pipe(reload({ stream:true }));
})

gulp.task('move-files', function() {
    gulp.src(['app/*.*', 'app/CNAME'])
        .pipe(gulp.dest('app/dist'));
})

// watch Sass files for changes, run the Sass preprocessor with the 'sass' task and reload
gulp.task('serve', ['move-files','sass', 'coffee', 'vendor'], function() {
  	browserSync({
    	server: {
      		baseDir: 'app/dist'
    	}
  	});

	gulp.watch(['app/*'], {cwd: 'app'}, reload);
	gulp.watch('app/sass/*.sass', ['sass']);
    gulp.watch('app/coffee/*', ['coffee']);
    gulp.watch('app/js/*.js', ['vendor']);
});



