var stripComments, notifier, parentDir, gulp, gulpConcat, gulpUtil, gulpJshint, gulpStylus, streamqueue, gulpPlumber, nib, jshint, gutil, dev, plumber, production, gulpJade, gulpFilter;

require('matchdep').filterDev('gulp-*').forEach(function(module){
    global[module.replace(/^gulp-/, '')] = require(module);
});

parentDir = '..';
stripComments = require('gulp-strip-comments');
notifier = require('node-notifier');

gulp = require('gulp');
gulpConcat = require('gulp-concat');
gulpUtil = require('gulp-util');
gulpJshint = require('gulp-jshint');
gulpStylus = require('gulp-stylus');
streamqueue = require('streamqueue');
gulpPlumber = require('gulp-plumber');
nib = require('nib');
jshint = require('gulp-jshint');
gutil = gulpUtil;

dev = gutil.env._[0] === 'dev';

plumber = function(){
    return gulpPlumber({
        errorHandler: function(it){
            gutil.beep();
            return gutil.log(gutil.colors.red(it.toString()));
        }
    });
};

if (gutil.env.env === 'production') {
    production = true;
}

gulp.task('default',['build']);

gulp.task('build', ['jade-compile', 'js:copy', 'css'], function(){
    notifier.notify({
        title: 'Compilation Complete',
        message: "The code has been compiled in the project's root directory"
    });
});

gulp.task('dev', ['jade-compile', 'js:copy', 'css'], function(done){
    gulp.watch(['app/jade/**/*.jade'], ['jade-compile']);
    return gulp.watch('app/stylus/**/*.styl', ['css']);
});

gulpJade = require('gulp-jade');

// task for rendering jade files to HTML
gulp.task('jade-compile', function(){
    var pretty;
    if (gutil.env.env !== 'production') {
        pretty = 'yes';
    }
    // only return the compiled index to root
    return gulp.src(['app/jade/index.jade']).pipe(gulpJade({
        pretty: pretty,
        basedir: parentDir
    })).pipe(gulp.dest(parentDir));
});

gulpFilter = require('gulp-filter');
gulpConcat = require('gulp-concat');

gulp.task('js:copy', function(){
    var s;
    s = streamqueue({
        objectMode: true
    });
    gulp.src('app/scripts/**/*.json')
        .pipe(gulp.dest(parentDir));

    gulp.src(['app/scripts/validators.js','app/scripts/service.js','app/scripts/template-manager.js','app/scripts/term-definitions.js','app/scripts/index.js'])
        .pipe(stripComments())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(gulpConcat('main.js'))
        .pipe(gulp.dest(parentDir));
    return s.done();
});

gulp.task('css', function(){
    var styl, s;
    styl = gulp.src(['app/stylus/**/styles.styl', 'app/stylus/**/mobile-styles.styl']).pipe(gulpFilter(function(it) {
        return !/\/_[^/]+\.styl$/.test(it.path);
    })).pipe(gulpStylus({
        use: [nib()],
        'import': ['nib']
    })).pipe(gulpConcat('styles.css')).pipe(gulp.dest(parentDir));

    return s = streamqueue({
        objectMode: true
    });
});
