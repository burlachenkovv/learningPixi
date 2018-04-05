'use strict';

var gulp = require('gulp'),

  babel = require('gulp-babel'),
  watch = require('gulp-watch'),
  sourcemaps = require('gulp-sourcemaps'),
  concat = require('gulp-concat'),

  rigger = require('gulp-rigger'),
  rimraf = require('rimraf'),

  browserSync = require("browser-sync"),
  reload = browserSync.reload;

var path = {
  build: {
    html: 'build/',
    js: 'build/js/',
    lib: 'build/lib/',
	  img: 'build/img/',
    css: 'build/css/',
    fonts: 'build/fonts/',
  },
  src: {
    html: 'src/index.html',
    js: 'src/js/script.js',
    lib: 'src/lib/*.js',
	  img: 'src/img/*.*',
    css: 'src/css/*.css',
    fonts: 'src/fonts/*.*',
  },
  watch: {
    html: 'src/*.html',
    js: 'src/js/**/*.js',
    lib: 'src/lib/*.js',
	  img: 'src/img/*.*',
    css: 'src/css/*.css',
    fonts: 'src/fonts/*.*',
  },
  clean: './build'
};
var config = {
  server: {
    baseDir: "./build/"
  },
  tunnel: false,
  host: 'localhost',
  port: 7000,
  logPrefix: "pixitest"
};

gulp.task('html:build', function () {
  gulp.src(path.src.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}));
});
gulp.task('lib:build', function() {
  gulp.src(path.src.lib)
    .pipe(gulp.dest(path.build.lib))
});
gulp.task('img:build', function() {
  gulp.src(path.src.img)
    .pipe(gulp.dest(path.build.img))
});
gulp.task('css:build', function() {
  gulp.src(path.src.css)
    .pipe(gulp.dest(path.build.css))
});
gulp.task('fonts:build', function() {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});
gulp.task('js:build', function () {
  gulp.src(path.src.js)
    .pipe(sourcemaps.init())
   .pipe(babel({
        presets: ['env']
    }))
    .pipe(rigger())
    .pipe(concat("main.js"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({stream: true}));
});

gulp.task('build', [
  'html:build',
  'lib:build',
  'img:build',
  'css:build',
  'fonts:build',
  'js:build'
]);

gulp.task('watch', function(){
  watch([path.watch.html], function(event, cb) {
    gulp.start('html:build');
  });
  watch([path.watch.lib], function(event, cb) {
    gulp.start('lib:build');
  });
  watch([path.watch.img], function(event, cb) {
    gulp.start('img:build');
  });
  watch([path.watch.css], function(event, cb) {
    gulp.start('css:build');
  });
  watch([path.watch.fonts], function(event, cb) {
    gulp.start('fonts:build');
  });
  watch([path.watch.js], function(event, cb) {
    gulp.start('js:build');
  });
});
gulp.task('webserver', function () {
  browserSync(config);
});
gulp.task('clean', function (cb) {
  rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);
  
  
  