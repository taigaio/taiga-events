var gulp = require('gulp');
var coffeelint = require('gulp-coffeelint');
var nodemon = require('gulp-nodemon');
var plumber = require("gulp-plumber");
var cache = require("gulp-cache");
var coffee = require("gulp-coffee");

gulp.task('lint', function () {
    gulp.src(['**/*.coffee', '!node_modules/**/*'])
        .pipe(cache(coffeelint('coffeelint.json'), {
            success: function (file) {
                return file.coffeelint.success;
            },
            value: function (file) {
                return {
                    coffeelint: file.coffeelint
                };
            }
        }))
        .pipe(coffeelint.reporter());
});

gulp.task('config', function() {
    return gulp.src('config.json')
        .pipe(gulp.dest('dist/'));
});

gulp.task("coffee", ['config'], function() {
    return gulp.src("*.coffee")
        .pipe(coffee())
        .pipe(gulp.dest("dist/"));
});

gulp.task('develop', function () {
  nodemon({ script: 'index.coffee'})
    .on('change', ['lint']);
});

gulp.task('default', [
    'develop'
]);
