const gulp = require('gulp');
const babel = require('gulp-babel');
const gulpif = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');

const debug = process.env.NODE_ENV === 'debug';

gulp.task('build', () => {
  return gulp.src('src/*.js')
    .pipe(gulpif(debug, sourcemaps.init()))
    .pipe(babel())
    .pipe(gulpif(debug, sourcemaps.write()))
    .pipe(gulp.dest('dist'));
});
