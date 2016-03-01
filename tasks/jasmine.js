const gulp = require('gulp');
const {jasmineBrowser, plumber} = require('gulp-load-plugins')();
const NoErrorsPlugin = require('webpack/lib/NoErrorsPlugin');
const webpack = require('webpack-stream');

const testAssets = function assets(options = {}) {
  const {watch, plugin} = options;
  const plugins = [new NoErrorsPlugin()];
  if(plugin) plugins.push(plugin);
  const webpackConfig = {
    bail: false,
    devtool: 'eval',
    module: {
      loaders: [
        {test: /\.js$/, exclude: /node_modules/, loader: 'babel?sourceMaps=true'}
      ]
    },
    output: {
      filename: 'spec.js'
    },
    plugins,
    watch
  };
  return gulp.src(['spec/**/*_spec.js'])
    .pipe(plumber())
    .pipe(webpack(webpackConfig));
};

gulp.task('jasmine', () => {
  const plugin = new (require('gulp-jasmine-browser/webpack/jasmine-plugin'))();
  return testAssets({watch: true, plugin})
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({whenReady: plugin.whenReady}));
});

gulp.task('spec', () => {
  return testAssets({watch: false})
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.headless({driver: 'phantomjs'}));
});
