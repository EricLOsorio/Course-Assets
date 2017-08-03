var gulp = require ( 'gulp' ),
    cleanCSS = require ( 'gulp-clean-css' ),
    uglify = require ( 'gulp-uglify' ),
    pump = require ( 'pump' ),
    htmllint = require ( 'gulp-htmllint' ),
    gutil = require( 'gulp-util' ),
    html5Lint = require( 'gulp-html5-lint'),
    cssmin = require( 'gulp-cssmin' ),
    rename = require( 'gulp-rename' ),
    csslint = require( 'gulp-csslint' ),
    jshint = require( 'gulp-jshint' ),
    sass = require( 'gulp-sass' ),
    jasmine = require( 'gulp-jasmine' ), 
    reporters = require( 'jasmine-reporters' ),
    jasmineBrowser = require( 'gulp-jasmine-browser' ),
    imagemin = require( 'gulp-imagemin' ),
    runSequence = require( 'run-sequence'),
    postcss = require( 'gulp-postcss' ),
    autoprefixer = require( 'autoprefixer'),
    cssnano = require( 'cssnano'),
    bump = require( 'gulp-bump'),
    minimist = require( 'minimist'),
    exec = require( 'gulp-exec');

var knownOptions = {
  
  type: 'type'

};

var options = minimist(process.argv.slice(1), knownOptions);

gulp.task('build',function(callback){

  runSequence('jshint','sass','csslint','minify-css',
               'compress','imagemin','jasmine',
	       'postcss','bump','deploy',callback);

});

gulp.task('deploy', function () {

  return gulp.src('')
             .pipe(exec('git add .'))
	     .pipe(exec('git commit -am "Releasing"'))
	     .pipe(exec('git push'))
	     .pipe(exec.reporter());

});


gulp.task( 'bump', function() {

// var knownOptions = {
 
//   type : 'type'
 
// }; 

// var options = minimist(process.argv.slice(1), knownOptions);
  
  if(options.type == 'minor'){
  
   gulp.src( ['./index.html', './package.json'] )
       .pipe(bump({type:'minor'}))
       .pipe(gulp.dest('./dest/gulp/bumps/bumps/minor'));
  
  } else if(options.type == 'major'){
  
      gulp.src(['.index.html', './package.json'] )
          .pipe(bump({type:'major'}))
	  .pipe(gulp.dest('./dest/gulp/bumps/bumps/major'));
  
  } else {

      gulp.src( ['./index.html','./package.json'] )
          .pipe(bump () )
          .pipe(gulp.dest('./dest/gulp/bumps/bumps'));
  }

});

gulp.task( 'postcss', function () {
  
  var plugins = [
  
    autoprefixer({browsers : ['last 2 versions']}),
    cssnano()
  ];

  return gulp.src( 'styles/style.css')
             .pipe(postcss(plugins))
	     .pipe(gulp.dest( 'dest/gulp' ));

});

gulp.task( 'minify-css', function() {
  return gulp.src( 'styles/*.css' )
    .pipe(cleanCSS())
    .pipe(gulp.dest( 'dest/gulp' ) );
});

gulp.task( 'compress' , function(cb){
  pump([
    gulp.src( 'js/*.js' ),
    uglify(),
    gulp.dest( 'dest/gulp' )
  ],

  cb

  );

});

gulp.task( 'do-htmllint', function(){
  return gulp.src( './*.html')
     .pipe(htmllint( { rules: {'indent-width' : false,
                               'line-end-style': false,
                               'class-style' : 'none' }},htmllintReporter));
});

function htmllintReporter(filepath, issues) {
  console.log('Into reporter');
  if(issues.length > 0) {
    issues.forEach(function (issue) {
      gutil.log(gutil.colors.cyan('[gulp-htmllint] ') + gutil.colors.white(filepath +' [' + issue.line + ',' + issue.column + ']: ') + gutil.colors.red('(' + issue.code + ') ' + issue.msg));
      });

      process.exitCode = 1;
   
   } else console.log('Done Without Issues');
 
 }

gulp.task( 'html5-lint', function() {
  return gulp.src('./*.html')
        .pipe(html5Lint());
});

gulp.task( 'cssmin', function () {

  gulp.src( 'styles/*.css')
       .pipe(cssmin())
       .pipe(rename({suffix: '.min'}))
       .pipe(gulp.dest('dest/gulp'));
});


gulp.task( 'csslint', function() {

  gulp.src( 'style/*.css' )
      .pipe(csslint() )
      .pipe(csslint.formatter() );

});


gulp.task('jshint', function() {

  return gulp.src( 'js/*.js' )
             .pipe(jshint() )
	     .pipe(jshint.reporter('default'));
});


gulp.task( 'sass', function () {

  return gulp.src( 'sass/*.scss' )
             .pipe(sass().on( 'error', sass.logError))
	     .pipe(gulp.dest( 'dest/gulp/css' ));
});

gulp.task( 'sass:watch', function () {

  gulp.watch( 'sass/*.scss', ['sass']);

});

gulp.task( 'jasmine', function () { 
    return gulp.src( 'spec/**/*Spec.js' )
          .pipe(jasmine () )
});

gulp.task( 'jasmineBrowser', function () {

  return gulp.src(['js/*.js', 'spec/**/*Spec.js'])
             .pipe(jasmineBrowser.specRunner())
	     .pipe(jasmineBrowser.server({port: 8888}));
});

gulp.task( 'imagemin', function() {

  gulp.src('img/*')
      .pipe(imagemin() )
      .pipe(gulp.dest( 'dest/gulp/images' ) )

});


gulp.task('default', function () {
  console.log('Gulp has run!');
});
