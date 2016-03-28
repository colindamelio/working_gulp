var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var notify = require('gulp-notify');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var lint = require('gulp-jshint');

//LOG ERROR
function errorlog(err){
  console.log(err.message);
  this.emit('end');
}

//SCSS COMPILER TASK
gulp.task('sass', function () {
  return gulp.src('app/scss/**/*.scss')
    .pipe(sourcemaps.init()) 
    .pipe(sass({outputStyle: 'compressed'}))
    .on("error", notify.onError(function (error) {
      return error.message;
    }))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer('last 2 versions')) 
    .pipe(gulp.dest('app/css/'))
    .pipe(browserSync.reload({
    	stream: true
    })) 
});

//JS LINTING
gulp.task('lint', function () {
  return gulp.src('app/js/**/*.js')
    .pipe(lint())
    .pipe(lint.reporter('jshint-stylish'));
})

//WATCH TASK
gulp.task('watch', ['browserSync', 'sass', 'lint'], function(){
  gulp.watch('app/scss/**/*.scss', ['sass']); 
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', ['lint', browserSync.reload]);
});

//BROWSERSYNC TASK
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
});


//USEREF TASKS CONCATENATES JS AND CSS FILES INTO .min
//UGLIFY AND CSSNANO MINIFY
gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

//IMAGE OPTIMIZATION TASK
gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
  .pipe(cache(imagemin({
  		interlaced: true
  	})))
  .pipe(gulp.dest('dist/images'))
});

gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

// Cleaning
// ---------------

gulp.task('clean', function() {
  return del.sync('dist').then(function(cb) {
    return cache.clearAll(cb);
  });
})

gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// Build Sequences - RUN 'GULP BUILD' FOR DIST FOLDER
// ---------------

gulp.task('default', function(callback) {
  runSequence(['sass', 'browserSync', 'watch'],
    callback
  )
})

gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    ['sass', 'useref', 'images', 'fonts'],
    callback
  )
})