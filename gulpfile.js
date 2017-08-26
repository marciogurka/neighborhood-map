var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	minifyCSS = require('gulp-minify-css'),
	plumber = require('gulp-plumber'),
	inline = require('gulp-inline'),
	minifyHTML = require('gulp-minify-html')

// Paths to various files
var paths = {
    scripts: ['dev/js/*.js'],
    styles: ['dev/css/*.css'],
    content: ['dev/index.html', 'dev/project-2048.html', 
    	'dev/project-mobile.html', 'dev/project-webperf.html'],
    optScripts: ['dev/views/js/*.js'],
    optStyles: ['dev/views/css/*.css'],
    optContent: ['dev/views/opt.html']
};

/* Minifies our opt HTML files and outputs them to prod/*.html */
gulp.task('optHTML', function() {
    return gulp.src(paths.optContent)
        .pipe(inline({
    	base: paths.optContent,
    	js: uglify,
    	css: minifyCSS,
    	disabledTypes: ['svg', 'img']
        }))
        .pipe(minifyHTML({ empty: true }))
		.pipe(gulp.dest('prod/views/'));
});


/* Minifies our JS files and outputs them to prod/views/js */
gulp.task('scripts', function(){
	/*look for any file that has javascript & css in filename*/
	gulp.src(paths.scripts)
		/* still run watch task even if error in code */
		.pipe(plumber())
		/* minify the file */
		.pipe(uglify())
		/* rename the file */
		.pipe(rename('perfmatters.min.js'))
		.pipe(plumber.stop())
		/*save destination for minified file*/
		.pipe(gulp.dest('prod/js/'));
});

/* Minifies our opt JS files and outputs them to prod/views/js */
gulp.task('optJS', function(){
	/*look for any file that has javascript & css in filename*/
	gulp.src(paths.optScripts)
		/* still run watch task even if error in code */
		.pipe(plumber())
		/*minify the file*/
		.pipe(uglify())
		/*rename the file*/
		.pipe(rename('main.min.js'))
		.pipe(plumber.stop())
		/*save destination for minified file*/
		.pipe(gulp.dest('prod/views/js/'));
});

/* Minifies our HTML files and outputs them to prod/*.html */
gulp.task('content', function() {
	return gulp.src(paths.content)
    	.pipe(inline({
    	base: paths.content,
    	js: uglify,
    	css: minifyCSS,
    	disabledTypes: ['svg', 'img'],
    	ignore: ['dev/js/perfmatters.js', 'http://www.google-analytics.com/analytics.js']
        }))
        .pipe(minifyHTML({ empty: true }))
		.pipe(gulp.dest('prod/'));
});

/* Minifies CSS files */
gulp.task('styles', function (){
	gulp.src(paths.styles)
		.pipe(minifyCSS())
		.pipe(gulp.dest('prod/css/'));

});

/* Minifies opt CSS files */
gulp.task('optCSS', function (){
	gulp.src(paths.optStyles)
		.pipe(minifyCSS())
		.pipe(gulp.dest('prod/views/css/'));

});

/* run gulp tasks in background when changes are made to file */
gulp.task('watch', function(){
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.styles, ['styles']);
	gulp.watch(paths.content, ['content']);
	gulp.watch(paths.optScripts, ['optJS']);
	gulp.watch(paths.optStyles, ['optCSS']);
	gulp.watch(paths.optContent ['optCSS']);
});

gulp.task('default', ['scripts', 'styles', 
	'content', 'optCSS',
	'optHTML', 'optJS', 'watch']);