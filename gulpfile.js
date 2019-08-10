const gulp = require("gulp");
const cleanCSS = require("gulp-clean-css");
const minifyHTML = require('gulp-minify-html');
const uglify = require('gulp-uglify-es').default;
const jsonminify = require('gulp-jsonminify');
const rm = require('gulp-rm');
const rename = require("gulp-rename");

function minifyCss(cb) {
    gulp.src("css/*.css")
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest("dist/css"));

    return cb();
}
exports.minifyCss = minifyCss;

function minifyHtml(cb) {
    var opts = {comments:true,spare:true};
    
    gulp.src('html/*.html')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest('dist/html'));

    return cb();
}
exports.minifyHtml = minifyHtml;

function minifyJs(cb) {
    gulp.src("js/**/*.js")
        .pipe(uglify())
        .pipe(gulp.dest("dist/js"));
    return cb();
}
exports.minifyJs = minifyJs;

function copyLib(cb) {
    gulp.src("lib/*.js")
        .pipe(gulp.dest("dist/lib"));
    return cb();
}
exports.copyLib = copyLib;

function minifyManifest(cb) {
    gulp.src("./manifest*.json")
        .pipe(jsonminify())
        .pipe(gulp.dest("./dist"));
    return cb();
}
exports.minifyManifest = minifyManifest;

function copyFont(cb) {
    gulp.src("./fonts/*")
        .pipe(gulp.dest("./dist/fonts"));
    return cb();
}
exports.copyFont = copyFont;

function copyImg(cb) {
    gulp.src("./img/**/*")
        .pipe(gulp.dest("./dist/img"));

    return cb();
}
exports.copyLib = copyImg;

exports.default = gulp.series(minifyCss, minifyHtml, minifyJs, minifyManifest, copyLib, copyFont, copyImg);

function deleteFileList(list) {
    gulp.src(list, {read: false})
        .pipe(rm());
}

// function finalizeChrome(cb) {
//     deleteFileList([
//         "./dist/manifest-firefox.json",
//     ]);
//     gulp.src("./dist/manifest-chrome.json")
//         .pipe(rename("manifest.json"))
//         .pipe(gulp.dest("./dist"));

//     return cb();
// }
// exports.finalizeChrome = finalizeChrome;

// function finalizeFirefox(cb) {
//     deleteFileList([
//         "./dist/manifest-chrome.json",
//         "./dist/js/common/chromepatch.js"
//     ]);
//     gulp.src("./dist/manifest-firefox.json")
//         .pipe(rename("manifest.json"))
//         .pipe(gulp.dest("./dist"));
// }
// exports.finalizeFirefox = finalizeFirefox;