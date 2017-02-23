const path = require('path'),
	autoprefixer = require('autoprefixer'),
	postcssInlineSvg = require('postcss-inline-svg'),
	postcssSvgo = require('postcss-svgo'),
	postcssUrl = require('postcss-url'),
	webpack = require('webpack'),
	webpackMerge = require('webpack-merge'),
	webpackDevMiddleware = require('webpack-dev-middleware'),
	webpackHotMiddleware = require('webpack-hot-middleware'),
	cssnano = require('cssnano'),
	importOnce = require('node-sass-import-once');

const webpackConfig = require(path.resolve(__dirname, 'webpack.config.js'));

const DEV_SERVER_HOST = 'localhost',
	DEV_SERVER_PORT = 3000;

const NODE_ENV = process.env.NODE_ENV || 'development',
	IS_DEV = NODE_ENV === 'development',
	IS_PROD = NODE_ENV === 'production';

const	ROOT_PATH = path.resolve(__dirname),
	SRC_PATH = path.resolve(__dirname, './src'),
	OUT_PATH = path.resolve(__dirname, './dist'),
	VENDOR_PATH = path.resolve(__dirname, './node_modules');

const JS_DIR = '/js',
	CSS_DIR = '/css',
	IMG_DIR = '/img',
	FAV_DIR = '/favicon',
	FONT_DIR = '/font',
	MOCK_DIR = '/mock';

function getPostCssSettings(plugins, IS_PROD) {
	let arr = [
		plugins.autoprefixer({
			browsers: [
				'> 2%',
				'last 2 version',
				'ie 9-11',
				'not ie <= 8'
			]
		}),
		plugins.inlineSvg({
			path: SRC_PATH + CSS_DIR
		}),
		plugins.svgo(),
		plugins.url()
	];
	if (IS_PROD) {
		arr.push(plugins.cssnano());
	}
	return arr;
}

function getSassSettings(OUT_PATH) {
	return {
		includePaths: [VENDOR_PATH, OUT_PATH + CSS_DIR],
		precision: 9,
		importer: importOnce,
		importOnce: {
			index: false,
			css: true,
			bower: false
		}
	};
}

function getBrowserSyncSettings(cfg) {
	return {
		server: {
			baseDir: cfg.OUT_PATH
		},
		host: DEV_SERVER_HOST,
		port: DEV_SERVER_PORT,
		middleware: [
      webpackDevMiddleware(cfg.bundler, {
        // IMPORTANT: dev middleware can't access config, so we should
        // provide publicPath by ourselves
        publicPath: cfg.OUT_PATH,
        // only warnings and errors
				noInfo: true
        // for other settings see
        // http://webpack.github.io/docs/webpack-dev-middleware.html
      }),

      // bundler should be the same as above
      webpackHotMiddleware(cfg.bundler)
    ]
	};
}

module.exports = {
	// dev server
	DEV_SERVER_HOST,
	DEV_SERVER_PORT,
	// environmental
	NODE_ENV,
	IS_DEV,
	IS_PROD,
	// paths
	SRC_PATH,
	OUT_PATH,
	ROOT_PATH,
	VENDOR_PATH,
	// directories
	JS_DIR,
	CSS_DIR,
	IMG_DIR,
	FAV_DIR,
	FONT_DIR,
	MOCK_DIR,
	// plugin settings
	SASS: getSassSettings(OUT_PATH),
	POSTCSS: getPostCssSettings({
		autoprefixer,
		inlineSvg: postcssInlineSvg,
		svgo: postcssSvgo,
		url: postcssUrl,
		cssnano
	}, IS_PROD),
	BROWSERSYNC: getBrowserSyncSettings({
		OUT_PATH,
		DEV_SERVER_HOST,
		DEV_SERVER_PORT,
		bundler: webpack(webpackConfig({
			IS_DEV: true,
			IS_PROD: false,
			SRC_PATH,
			OUT_PATH,
			ROOT_PATH,
			VENDOR_PATH,
			JS_DIR,
		}))
	}),
	WEBPACK: webpackConfig({
		IS_DEV,
		IS_PROD,
		SRC_PATH,
		OUT_PATH,
		ROOT_PATH,
		VENDOR_PATH,
		JS_DIR,
	})
};
