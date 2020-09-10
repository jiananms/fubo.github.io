var gulp = require('gulp'),
    del = require('del'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    gulpLoadPlugins = require('gulp-load-plugins');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

gulp.task('default', function(cb) {
  runSequence(
    'clean',
    'optimize:css',
    ['lint', 'optimize:js', 'optimize:images', 'copy'],
    'fontmin',
    'optimize:html',
    cb
  );
});

gulp.task('build', function(cb) {
  runSequence(
    'dist-clean',
    'optimize:images',
    'fontmin',
    'minify',
    cb
  );
});

gulp.task('build:fix', ['build'], function() {
  gulp.src('dist/index.{html,htm}')
    .pipe($.replace(/(href|src)="assets\/(.+?)"/g, '$1="__JOIN__/mobile/$2"'))
    .pipe(gulp.dest('dist'));
});

// Lint JavaScript
gulp.task('lint', function() {
  return gulp.src('app/assets/js/**/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failOnError()))
});

gulp.task('clean', function(cb) {
  return del(['.tmp', 'dist/*', '!dist/.git', 'build/*'], { dot: true });
});

gulp.task('build-clean', function(cb) {
  return del('build/*');
});

gulp.task('dist-clean', function(cb) {
  return del('dist/*');
});

// Copy all files at the root level
gulp.task('copy', function() {
  return gulp.src([
    'app/*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
});

gulp.task('minify', function() {
  return gulp.src(['app/**/*.{htm,html}', '!app/assets/vendor/**/*'])
    .pipe($.usemin({
      assetsDir: 'app',
      html: [
        function() {
          return $.htmlmin({
            removeComments: true,
            removeCommentsFromCDATA: true,
            removeCDATASectionsFromCDATA: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            collapseWhitespace: true,
            caseSensitive: true
          });
        }
      ],
      css: [
        $.autoprefixer(['ie_mob >= 10', 'ios >= 7', 'android >= 4.4']),
        $.cssnano({ discardComments: { removeAll: true }, reduceIdents: { keyframes: false } }),
        'concat',
        $.rev()
      ],
      js: [
        $.uglify({ preserveComments: 'some' }),
        'concat',
        $.rev()
      ],
      inlinejs: [
        $.uglify({ preserveComments: 'some' })
      ],
      inlinecss: [
        $.cssnano(),
        'concat'
      ]
    }))
    .pipe($.size())
    .pipe(gulp.dest('dist'));
});

gulp.task('optimize:css', function() {
  var AUTOPREFIXER_BROWSERS = [
    'ie_mob >= 10',
    'chrome >= 34',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];
  return gulp.src('app/assets/css/**/*.css')
    .pipe($.newer('.tmp/assets/css'))
    .pipe($.sourcemaps.init())
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/assets/css'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.rev())
    .pipe($.size({ title: 'styles' }))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/assets/css'));
});

// Optimize images
gulp.task('optimize:images', function() {
  return gulp.src('app/assets/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/assets/images'))
    .pipe($.size({title: 'images'}))
});

gulp.task('optimize:js', function() {
  return gulp.src('app/assets/js/**/*.js')
    .pipe(gulp.dest('dist/assets/js'))
    .pipe($.uglify({ preserveComments: 'some' }))
    .pipe($.rename({ extname: '.min.js' }))
    .pipe($.rev())
    .pipe($.size({title: 'scripts'}))
    .pipe(gulp.dest('dist/assets/js'));
});

gulp.task('optimize:html', ['minify'], function() {
  return gulp.src('dist/**/*.{htm,html}')
    .pipe($.htmlmin({
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeCDATASectionsFromCDATA: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      collapseWhitespace: true,
      caseSensitive: true
    }))
    .pipe($.if('*.html', $.size({ title: 'html', showFiles: true })))
    .pipe(gulp.dest('dist'));
});

gulp.task('optimize:fonts', ['fontmin'], function() {
  return;
});

// Watch files for changes & reload
gulp.task('serve', ['optimize:js', 'optimize:css'], function() {
  browserSync({
    notify: false,
    logPrefix: 'Token',
    server: ['.tmp', 'app'],
    port: 3000
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/assets/css/**/*.css'], ['optimize:css', reload]);
  gulp.watch(['app/assets/js/**/*.js'], ['lint', 'optimize:js', reload]);
  gulp.watch(['app/assets/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
  browserSync({
    notify: false,
    logPrefix: 'Token',
    server: 'dist',
    port: 3001
  });
});

gulp.task('fontmin', function(cb) {
  var buffers = [];
  gulp.src('app/**/*.{htm,html}')
    .on('data', function(file) {
      buffers.push(file.contents);
    })
    .on('end', function() {
      var text = Buffer.concat(buffers).toString('utf-8').replace(/!/g, "");
      gulp
        .src('app/assets/fonts/*.ttf')
        .pipe($.fontmin({
          text: text
        }))
        .pipe(gulp.dest('dist/assets/fonts'))
        .on('end', cb);
    });
});
