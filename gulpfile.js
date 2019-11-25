const gulp = require('gulp'),
  del = require('del'),
  sourcemaps = require('gulp-sourcemaps'),
  plumber = require('gulp-plumber'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  minifyCss = require('gulp-clean-css'),
  babel = require('gulp-babel'),
  webpack = require('webpack-stream'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  imagemin = require('gulp-imagemin'),
  browserSync = require('browser-sync').create(),
  src_folder = './src/',
  src_assets_folder = src_folder + 'assets/',
  dist_folder = './dist/',
  dist_assets_folder = dist_folder + 'assets/';

const config = {
  paths: {
    src: {
      main: 'dist/',
    },
    dist: {
      main: 'src/',
    },
  },
};

gulp.task('clear', () => del([dist_folder]));

gulp.task('html', () => {
  return gulp
    .src([src_folder + '**/*.html'], {
      base: src_folder,
      since: gulp.lastRun('html'),
    })
    .pipe(gulp.dest(dist_folder))
    .pipe(browserSync.stream());
});

gulp.task('sass', () => {
  return gulp
    .src([
      src_assets_folder + 'scss/**/*.scss',
      src_assets_folder + 'sass/**/*.sass',
    ])
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(minifyCss())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dist_assets_folder + 'css'))
    .pipe(browserSync.stream());
});

gulp.task('js', () => {
  return gulp
    .src([src_assets_folder + 'js/**/*.js'], { since: gulp.lastRun('js') })
    .pipe(plumber())
    .pipe(
      webpack({
        mode: 'production',
      })
    )
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dist_assets_folder + 'js'))
    .pipe(browserSync.stream());
});

gulp.task('images', () => {
  return gulp
    .src([src_assets_folder + 'images/**/*.+(png|jpg|jpeg|gif|svg|ico)'], {
      since: gulp.lastRun('images'),
    })
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(dist_assets_folder + 'images'))
    .pipe(browserSync.stream());
});

gulp.task('build', gulp.series('clear', 'html', 'sass', 'js', 'images'));

gulp.task('dev', gulp.series('html', 'sass', 'js'));

gulp.task('serve', () => {
  return browserSync.init({
    server: {
      baseDir: ['dist'],
    },
    port: 3000,
    open: false,
  });
});

gulp.task('watch', () => {
  const watchImages = [
    src_assets_folder + 'images/**/*.+(png|jpg|jpeg|gif|svg|ico)',
  ];

  const watch = [
    src_folder + '**/*.html',
    src_assets_folder + 'sass/**/*.sass',
    src_assets_folder + 'scss/**/*.scss',
    src_assets_folder + 'js/**/*.js',
  ];

  gulp.watch(watch, gulp.series('dev')).on('change', browserSync.reload);
  gulp
    .watch(watchImages, gulp.series('images'))
    .on('change', browserSync.reload);
});

gulp.task('default', gulp.series('build', gulp.parallel('serve', 'watch')));
