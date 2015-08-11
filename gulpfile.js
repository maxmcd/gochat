var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    concat = require('gulp-concat'),
    sass = require('gulp-ruby-sass'),
    coffee = require('gulp-coffee'),
    ghPages = require('gulp-gh-pages'),
    react = require('gulp-react'),
    http = require('http'),
    st = require('st')

gulp.task('jsx', function () {
    return gulp.src('app/jsx/*.jsx')
        .pipe(react({harmony: true}))
        .on('error', function(e){
            console.log(e);
            this.emit('end');
        })
        .pipe(concat('app.js'))
        .pipe(gulp.dest('app/dist/js'))
        .pipe(livereload());
});
 
gulp.task('deploy', function() {
  return gulp.src('app/dist/**/*')
    .pipe(ghPages());
});

gulp.task('sass', function() {
  	return sass('app/sass/style.sass')
    	.pipe(gulp.dest('app/dist/css'))
    	.pipe(livereload());
});

gulp.task('vendor', function() {
    gulp.src('app/js/*.js')
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('app/dist/js'))
        .pipe(livereload());
})

gulp.task('move-files', function() {
    gulp.src(['app/*.*', 'app/CNAME'])
        .pipe(gulp.dest('app/dist'));
})


// watch Sass files for changes, run the Sass preprocessor with the 'sass' task and reload
gulp.task('serve', ['server', 'move-files','sass', 'jsx', 'vendor'], function() {
    livereload.listen({
        basePath: "app/dist",
        port: '3000'
    });
	gulp.watch(['app/*'], ['move-files', livereload()]);
	gulp.watch('app/sass/*.sass', ['sass']);
    gulp.watch('app/jsx/*', ['jsx']);
    gulp.watch('app/js/*.js', ['vendor']);
});

gulp.task('server', function(done) {
  http.createServer(
    st({ path:'app/dist', index: 'index.html', cache: false })
  ).listen(8080, done);
});


