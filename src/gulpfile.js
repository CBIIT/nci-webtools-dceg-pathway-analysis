var stripComments, notifier, parentDir, gulp, gulpConcat, gulpUtil, gulpJshint, gulpStylus, streamqueue, gulpIf, gulpPlumber, nib, jshint, gutil, dev, plumber, production, gulpJade, gulpBower, mainBowerFiles, gulpFilter, gulpCsso, gulpJsonEditor, gulpInsert;

require('matchdep').filterDev('gulp-*').forEach(function(module){
    global[module.replace(/^gulp-/, '')] = require(module);
});

stripComments = require('gulp-strip-comments');
notifier = require('node-notifier');
parentDir = '..';

gulp = require('gulp');
gulpConcat = require('gulp-concat');
gulpUtil = require('gulp-util');
gulpJshint = require('gulp-jshint');
gulpStylus = require('gulp-stylus');
streamqueue = require('streamqueue');
gulpIf = require('gulp-if');
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

gulp.task('build', ['jade-compile', 'bower', 'js:copy', 'css'], function(){
    notifier.notify({
        title: 'Compilation Complete',
        message: "The code has been compiled in the project's root directory"
    });
});

gulp.task('dev', ['jade-compile', 'js:copy', 'ls:app', 'css'], function(done){
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
    })).pipe(gulp.dest(parentDir + "/static"));
});

gulpBower = require('gulp-bower');
mainBowerFiles = require('main-bower-files');
gulpFilter = require('gulp-filter');
gulpCsso = require('gulp-csso');
gulpConcat = require('gulp-concat');
gulpJsonEditor = require('gulp-json-editor');
gulpInsert = require('gulp-insert');

gulp.task('bower', function(){
    return gulpBower();
});

gulp.task('js:copy', ['bower'], function(){
    var s;
    s = streamqueue({
        objectMode: true
    });
    gulp.src('app/scripts/**/*.json')
        .pipe(gulp.dest(parentDir));

    gulp.src(['app/scripts/**/*.js'])
        .pipe(stripComments())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(gulpConcat('main.js'))
        .pipe(gulp.dest(parentDir+"/static"));
    return s.done();
});

gulp.task('css', ['bower'], function(){
    var bower, styl, s;
    bower = gulp.src(mainBowerFiles()).pipe(gulpFilter(function(it){
        return /\.css$/.exec(it.path);
    }));
    styl = gulp.src('app/stylus/**/*.styl').pipe(gulpFilter(function(it) {
        return !/\/_[^/]+\.styl$/.test(it.path);
    })).pipe(gulpStylus({
        use: [nib()],
        'import': ['nib']
    })).pipe(gulpConcat('styles.css')).pipe(gulp.dest(parentDir+"/static"));

    return s = streamqueue({
        objectMode: true
    });
});
