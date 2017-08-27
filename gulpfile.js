var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	minify = require('gulp-minify'),
	rename = require('gulp-rename'),
	minifyCSS = require('gulp-minify-css'),
	plumber = require('gulp-plumber'),
	inline = require('gulp-inline'),
	minifyHTML = require('gulp-minify-html')

// Paths to various files
var paths = {
    scripts: ['dev/js/*.js'],
    libs: ['node_modules/knockout/build/output/knockout-latest.js'],
    styles: ['dev/css/*.css'],
    content: ['dev/index.html']
};

/* Minifies our JS files */
gulp.task('scripts', function(){
	/*look for any file that has javascript & css in filename*/
	gulp.src(paths.scripts)
		/* still run watch task even if error in code */
		.pipe(plumber())
		/* minify the file */
		.pipe(uglify())
		/* rename the file */
		.pipe(rename('neighborhood.min.js'))
		.pipe(plumber.stop())
		/*save destination for minified file*/
		.pipe(gulp.dest('dist/js/'));
});

/* Copy our JS libs files located at node_modules */
gulp.task('libsCopy', function(){
	/*look for any file that has javascript & css in filename*/
	gulp.src(paths.libs)
		/* still run watch task even if error in code */
		.pipe(plumber())
		/* rename the file */
		.pipe(rename('libs.js'))
		.pipe(plumber.stop())
		/*save destination for minified file*/
		.pipe(gulp.dest('dev/js/'));
});

/* Minifies our JS libs files located at node_modules */
gulp.task('libs', function(){
	/*look for any file that has javascript & css in filename*/
	gulp.src(paths.libs)
		/* still run watch task even if error in code */
		.pipe(plumber())
		/* rename the file */
		.pipe(rename('libs.min.js'))
		.pipe(plumber.stop())
		/*save destination for minified file*/
		.pipe(gulp.dest('dist/js/'));
});

/* Minifies our HTML files */
gulp.task('content', function() {
	return gulp.src(paths.content)
    	.pipe(inline({
    	base: paths.content,
    	js: minify,
    	css: minifyCSS,
    	disabledTypes: ['svg', 'img']
        }))
        .pipe(minifyHTML({ empty: true }))
		.pipe(gulp.dest('dist/'));
});

/* Minifies CSS files */
gulp.task('styles', function (){
	gulp.src(paths.styles)
		.pipe(minifyCSS())
		.pipe(gulp.dest('dist/css/'));

});

/* run gulp tasks in background when changes are made to file */
gulp.task('watch', function(){
	gulp.watch(paths.libs, ['libsCopy']);
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.libs, ['libs']);
	gulp.watch(paths.styles, ['styles']);
	gulp.watch(paths.content, ['content']);
});

gulp.task('default', ['libsCopy','scripts', 'styles', 'libs','content', 'watch']);