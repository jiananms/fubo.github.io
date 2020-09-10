var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyhtml = require('gulp-minify-html'),
    minifycss = require('gulp-minify-css'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    rename = require('gulp-rename'),
    size = require('gulp-size'),
    del = require('del'),
    fontmin = require('gulp-fontmin');

gulp.task('default', function(cb) {
  runSequence(
    'build-clean',
    ['optimize:css', 'optimize:js'],
    'copy-images',
    'fontmin',
    'minify',
    cb
  );
});

gulp.task('build-clean', function(cb) {
  return del('build');
});

gulp.task('dist-clean', function(cb) {
  return del('dist');
});

gulp.task('minify', function() {
  return gulp.src('src/**/*.{htm,html}')
    .pipe(usemin({
      assetsDir: 'src',
      html: [
        htmlmin({
          removeComments: true,
          removeCommentsFromCDATA: true,
          removeCDATASectionsFromCDATA: true,
          collapseWhitespace: true,
          preserveLineBreaks: true,
          caseSensitive: true
        })
      ],
      css: [
        autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'),
        minifycss(),
        'concat'
      ],
      js: [
        uglify(),
        'concat'
      ],
      inlinejs: [
        uglify()
      ],
      inlinecss: [
        minifycss(),
        'concat'
      ]
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('optimize:css', function() {
  return gulp.src('src/assets/planet/css/**/*.css')
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('build/assets/planet/css'))
    .pipe(minifycss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('build/assets/planet/css'))
    .pipe(size());
});

gulp.task('optimize:js', function() {
  return gulp.src('src/assets/planet/js/**/*.js')
    .pipe(gulp.dest('build/assets/planet/js'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('build/assets/planet/js'))
    .pipe(size());
});

gulp.task('optimize:html', ['minify'], function() {
  return gulp.src('build/**/*.{htm,html}')
    .pipe(htmlmin({
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeCDATASectionsFromCDATA: true,
      collapseWhitespace: true,
      preserveLineBreaks: true,
      caseSensitive: true
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('optimize:fonts', ['fontmin'], function() {
  return;
});

gulp.task('fontmin', function(cb) {
  var buffers = [];
  gulp.src('src/**/*.{htm,html}')
    .on('data', function(file) {
      buffers.push(file.contents);
    })
    .on('end', function() {
      var text = Buffer.concat(buffers).toString('utf-8').replace(/!/g, "");
      gulp
        .src('src/assets/planet/fonts/*.ttf')
        .pipe(fontmin({
          text: text
        }))
        .pipe(gulp.dest('build/assets/planet/fonts'))
        .on('end', cb);
    });
});

gulp.task('copy-images', function() {
  return gulp.src('src/assets/planet/images/**/*.{jpg,jpeg,png,svg,gif}')
    .pipe(gulp.dest('build/assets/planet/images'));
});

gulp.task('deploy', ['dist-clean'], function() {
  return gulp.src('build/**/*')
    .pipe(gulp.dest('dist'));
});
