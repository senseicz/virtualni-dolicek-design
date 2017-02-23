// Node requires - gulp etc.
const path = require('path'),
del = require('del'),
gulp = require('gulp'),
vinylNamed = require('vinyl-named'),
webpackStream = require('webpack-stream'),
runSequence = require('run-sequence'),
browserSync = require('browser-sync'),
gulpLoadPlugins = require('gulp-load-plugins');

// Load gulp plugins
const plugins = gulpLoadPlugins();

// Configuration object made up from build.config file & passed arguments
const cfg = require(path.resolve(__dirname, 'build.config.js'));

// create a browserSync instance
var devServer = browserSync.create();

// Overwrite the gulp.src method to eliminate the need of adding the error handler to each task
var gulp_src = gulp.src;
gulp.src = function() {
	return gulp_src
	.apply(gulp, arguments)
	.pipe(plugins.plumber(errorHandler));
};

// Overwrite the gulp.task method to eliminate the need of checking the output path in each task
var gulp_task = gulp.task;
gulp.task = function() {
	if (cfg.OUT_PATH) {
		return gulp_task.apply(gulp, arguments);
	} else {
		errorHandler.call(gulp, {
			plugin: arguments[0] + ' task',
			message: 'Output path was not set.'
		});
		return gulp;
	}
};

//=============================================
// MAIN TASKS - defined in package.json
//=============================================

// Default task which builds assets, watch changes and runs a server
gulp.task('start', function (cb) {
	runSequence(['build', 'mocks'], ['watch', 'serve'], cb);
});

// Task for building assets
gulp.task('build', function (cb) {
	runSequence(['scripts:clean', 'styles:clean', 'fonts:clean', 'images:clean', 'mocks:clean'], ['scripts', 'styles', 'vendorStyles', 'fonts', 'images', 'mocks'], cb);
});

// Task for watching asset changes
gulp.task('watch', function (cb) {
	runSequence(['scripts:watch', 'styles:watch', 'fonts:watch', 'images:watch', 'mocks:watch'], cb);
});

//=============================================
// SUB TASKS
//=============================================

//---------------------------------------------
// Clean output directories
//---------------------------------------------

gulp.task('scripts:clean', function() {
	return del([cfg.OUT_PATH + cfg.JS_DIR], { force: true });
});

gulp.task('styles:clean', function() {
	return del([cfg.OUT_PATH + cfg.CSS_DIR], { force: true });
});

gulp.task('fonts:clean', function() {
	return del([cfg.OUT_PATH + cfg.FONT_DIR], { force: true });
});

gulp.task('images:clean', function() {
	return del([cfg.OUT_PATH + cfg.IMG_DIR], { force: true });
});

gulp.task('mocks:clean', function() {
	return del([cfg.OUT_PATH + '/*.html'], { force: true });
});

//---------------------------------------------
// JavaScript
//---------------------------------------------

gulp.task('scripts', function () {
	var wp_cfg = Object.assign({}, cfg.WEBPACK);

	delete wp_cfg.entry;

	return gulp.src(cfg.SRC_PATH + cfg.JS_DIR + '/*.js')
		.pipe(vinylNamed())
		.pipe(webpackStream(wp_cfg, null, function(err, stats) {
			//do nothing here as the erros are handled by gulp-plumber
		}))
		.pipe(gulp.dest(cfg.OUT_PATH + cfg.JS_DIR));
});

//---------------------------------------------
// CSS Styles
//---------------------------------------------

gulp.task('styles', function () {
	return gulp.src(cfg.SRC_PATH + cfg.CSS_DIR + '/*.scss')
		.pipe(plugins.if(cfg.IS_DEV, plugins.sourcemaps.init()))
		.pipe(plugins.sass(cfg.SASS).on('error', plugins.sass.logError))
		.pipe(plugins.postcss(cfg.POSTCSS))
		.pipe(plugins.if(cfg.IS_DEV, plugins.sourcemaps.write('.')))
		.pipe(gulp.dest(cfg.OUT_PATH + cfg.CSS_DIR));
});

gulp.task('vendorStyles', function() {
	return gulp.src(cfg.SRC_PATH + cfg.CSS_DIR + '/*.css')
	.pipe(gulp.dest(cfg.OUT_PATH));
});

//---------------------------------------------
// Fonts
//---------------------------------------------

gulp.task('fonts', function () {
	return gulp.src(cfg.SRC_PATH + cfg.FONT_DIR + '/**/*.{*.eot,*.woff,*.ttf,*.svg}')
		.pipe(gulp.dest(cfg.OUT_PATH + cfg.FONT_DIR));
});

//---------------------------------------------
// Favicon
//---------------------------------------------

gulp.task('favIcon', function () {
	return gulp.src(cfg.SRC_PATH + cfg.FAV_DIR + '/**/*.{svg,png,ico}')
		.pipe(plugins.imagemin())
		.pipe(gulp.dest(cfg.OUT_PATH));
});

gulp.task('manifest', function () {
	return gulp.src(cfg.SRC_PATH + cfg.FAV_DIR + '/**/*.{json,xml}')
		.pipe(gulp.dest(cfg.OUT_PATH));
});

//---------------------------------------------
// Images
//---------------------------------------------

gulp.task('svg2png', function () {
	return gulp.src(cfg.SRC_PATH + cfg.IMG_DIR + '/**/*.svg')
		.pipe(plugins.raster())
		.pipe(plugins.rename({extname: '.png'}))
		.pipe(plugins.imagemin())
		.pipe(gulp.dest(cfg.OUT_PATH + cfg.IMG_DIR));
});

gulp.task('copyImages', function () {
	return gulp.src(cfg.SRC_PATH + cfg.IMG_DIR + '/**/*.{svg,png,gif,jpg}')
		.pipe(plugins.imagemin())
		.pipe(gulp.dest(cfg.OUT_PATH + cfg.IMG_DIR));
});

gulp.task('images', function (cb) {
	runSequence(['svg2png', 'copyImages', 'favIcon', 'manifest'], cb);
});

//---------------------------------------------
// Create static pages
//---------------------------------------------
gulp.task('mocks', function () {
		return gulp.src(cfg.SRC_PATH + cfg.MOCK_DIR + '/[^_]*.{html,shtml}')
			.pipe(plugins.ssi({
				root: cfg.SRC_PATH + cfg.MOCK_DIR,
				ext: 'html'
			}))
			.pipe(gulp.dest(cfg.OUT_PATH));
})

//---------------------------------------------
// Create watchers for development process
//---------------------------------------------

gulp.task('scripts:watch', function () {
	gulp.watch(cfg.SRC_PATH + cfg.JS_DIR + '/**/*.js', function () {
		runSequence('scripts', devServer.reload);
	});
});

gulp.task('styles:watch', function () {
	gulp.watch(cfg.SRC_PATH + cfg.CSS_DIR + '/**/*.scss', function () {
		runSequence('styles', devServer.reload);
	});
});

gulp.task('fonts:watch', function () {
	gulp.watch(cfg.SRC_PATH + cfg.FONT_DIR + '/*.{*.eot,*.woff,*.ttf,*.svg}', function () {
		runSequence('fonts', devServer.reload);
	});
});

gulp.task('images:watch', function () {
	gulp.watch(cfg.SRC_PATH + cfg.IMG_DIR + '/*.{svg,png,gif,jpg}', function () {
		runSequence('images', devServer.reload);
	});
});

gulp.task('mocks:watch', function () {
	gulp.watch(cfg.SRC_PATH + cfg.MOCK_DIR + '/**/*.{html,shtml}', function () {
		runSequence('mocks', devServer.reload);
	});
});

//---------------------------------------------
// Create server for development process
//---------------------------------------------

gulp.task('serve', function () {
	devServer.init(cfg.BROWSERSYNC);
});

//=============================================
// UTILITIES
//=============================================

// Error handling helper
function errorHandler(error = {}) {
	// Output an error message & beep
	plugins.util.log(plugins.util.colors.red.bold('Error (' + error.plugin + '): ' + error.message));
	plugins.util.beep();
	// emit the end event, to properly end the task
	this.emit('end');
}
