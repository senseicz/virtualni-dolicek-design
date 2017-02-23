const path = require('path'),
	webpack = require('webpack'),
	webpackMerge = require('webpack-merge');

function common(cfg) {
	return {
		target: 'web',
		output: {
			path: path.resolve(cfg.OUT_PATH, cfg.JS_DIR),
			filename: '[name].bundle.js',
			publicPath: '/'
		},
		module: {
			loaders: [
				{
					test: /\.jsx?$/,
					loader: 'babel-loader',
					exclude: cfg.VENDOR_PATH,
					query: {
						cacheDirectory: true,
						presets: ['babel-preset-es2015'].map(require.resolve)
					}
				},
				{
	        test: /\.modernizrrc$/,
	        loader: 'modernizr-loader'
	      }
			]
		},
		plugins: [
			new webpack.ProvidePlugin({
					$: 'jquery',
					jQuery: 'jquery'
			})
		],
		cache: {},
		resolveLoader: {
			root: cfg.VENDOR_PATH
		},
		resolve: {
			root: [path.resolve(cfg.SRC_PATH + cfg.JS_DIR), cfg.VENDOR_PATH],
			// TODO: reconsider root vs modulesDirectories
			//modulesDirectories: [cfg.VENDOR_PATH],
			alias: {
				'lib': cfg.SRC_PATH + cfg.JS_DIR + '/lib',
				'bootstrap': cfg.VENDOR_PATH + '/bootstrap-sass/assets/javascripts/bootstrap',
				'bootstrap-hover-dropdown': cfg.VENDOR_PATH + '/bootstrap-hover-dropdown',
				'handlebars': cfg.VENDOR_PATH + '/lib/handlebars/handlebars',
				'jquery': cfg.VENDOR_PATH + '/jquery/dist/jquery',
				'jquery/bloodhound': cfg.VENDOR_PATH + '/typeahead.js/dist/bloodhound',
				'jquery/cookie': cfg.VENDOR_PATH + '/jquery.cookie/jquery.cookie',
				'jquery/typeahead': cfg.VENDOR_PATH + '/typeahead.js/dist/typeahead.jquery',
				'jquery.validate': cfg.VENDOR_PATH + '/jquery-validation/dist/jquery.validate',
				'jquery.validate-pattern': cfg.VENDOR_PATH + '/jquery-validation/src/additional/pattern',
				'jquery/validate-unobtrusive': cfg.VENDOR_PATH + '/jquery-validation-unobtrusive/jquery.validate.unobtrusive',
				'polyfill/placeholder': cfg.VENDOR_PATH + '/jquery-placeholder/jquery.placeholder',
				'polyfill/respond': cfg.VENDOR_PATH + '/respond/dest/respond.src',
				'modernizr$': cfg.ROOT_PATH + '/.modernizrrc'
			}
		}
	};
}


function development(cfg) {
	return {
		entry: [
			'webpack/hot/dev-server',
    	'webpack-hot-middleware/client'
		],
		debug: true,
		devtool: 'eval-cheap-source-map',
		module: {
			preLoaders: [{
				test: /\.jsx?$/,
				loader: 'eslint-loader',
				exclude: cfg.VENDOR_PATH
			}]
		},
		plugins: [
			new webpack.optimize.OccurenceOrderPlugin(),
	    new webpack.HotModuleReplacementPlugin(),
	    new webpack.NoErrorsPlugin()
	  ]
	};
}

function production(cfg) {
	return {
		devtool: 'hidden-source-map',
		plugins: [
			new webpack.optimize.CommonsChunkPlugin('commons.js'),
			new webpack.optimize.UglifyJsPlugin({ sourceMap: false })
		]
	};
}

module.exports = function(cfg) {
	var webpackConfig = common(cfg);
	if (cfg.IS_DEV) {
		webpackConfig = webpackMerge(webpackConfig, development(cfg));
	}
	if (cfg.IS_PROD) {
		webpackConfig = webpackMerge(webpackConfig, production(cfg));
	}
	return webpackConfig;
}
