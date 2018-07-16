var gulp = require("gulp");
var cleanCSS = require("gulp-clean-css");
var minifyHTML = require('gulp-minify-html');
var uglify = require('gulp-uglify-es').default;
var pump = require('pump');
var jsonminify = require('gulp-jsonminify');

gulp.task("default", ["minify-css", "minify-html", "minify-js", "minify-manifest", "copy-lib", "copy-font", "copy-img"])

gulp.task("minify-css", () => {
    return gulp.src("css/*.css")
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest("dist/css"))
});
gulp.task("minify-html", () => {
    var opts = {comments:true,spare:true};
    
    gulp.src('html/*.html')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest('dist/html'))
});
gulp.task("minify-js", () => {
    gulp.src("js/**/*.js")
        .pipe(uglify())
        .pipe(gulp.dest("dist/js"));
});
gulp.task('minify-js', (cb) => {
    pump([
          gulp.src('js/**/*.js'),
          uglify(),
          gulp.dest('dist/js')
      ],
      cb
    );
  });
gulp.task("copy-lib", () => {
    gulp.src("lib/*.js")
        .pipe(gulp.dest("dist/lib"))
})
gulp.task('minify-manifest', () => {
    gulp.src("manifest.json")
        .pipe(jsonminify())
        .pipe(gulp.dest("dist"))
})
gulp.task("copy-font", () => {
    gulp.src("fonts/*")
        .pipe(gulp.dest("dist/fonts"));
})
gulp.task("copy-img", () => {
    gulp.src("img/**/*")
        .pipe(gulp.dest("dist/img"))
})