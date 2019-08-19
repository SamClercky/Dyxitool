const gulp = require("gulp");
const cleanCSS = require("gulp-clean-css");
const minifyHTML = require('gulp-minify-html');
const uglify = require('gulp-uglify-es').default;
const jsonminify = require('gulp-jsonminify');
const rm = require('gulp-rm');
const rename = require("gulp-rename");

function minifyCss(exceptions) {
    return cb => {
        console.info(">>> minifyCss");
        gulp.src(["css/*.css", ...exceptions])
            .pipe(cleanCSS({ compatibility: 'ie8' }))
            .pipe(gulp.dest("dist/css"));

        return cb();
    }
}
exports.minifyCss = minifyCss([]);

function minifyHtml(exceptions) {
    return cb => {
        console.info(">>> minifyHtml");
        var opts = { comments: true, spare: true };

        gulp.src(['html/*.html', ...exceptions])
            .pipe(minifyHTML(opts))
            .pipe(gulp.dest('dist/html'));

        return cb();
    }
}
exports.minifyHtml = minifyHtml([]);

function minifyJs(exceptions) {
    console.info(">>> minifyJs");
    return cb => {
        gulp.src(["js/**/*.js", ...exceptions])
            .pipe(uglify())
            .pipe(gulp.dest("dist/js"));
        return cb();
    }
}
exports.minifyJs = minifyJs([]);

function copyLib(exceptions) {
    return cb => {
        console.info(">>> copyLib");
        gulp.src(["lib/**/*", ...exceptions])
            .pipe(gulp.dest("dist/lib"));
        return cb();
    }
}
exports.copyLib = copyLib([]);

function minifyManifest(exceptions) {
    return cb => {
        console.info(">>> minifyManifest");
        gulp.src(["./manifest*.json", ...exceptions])
            .pipe(jsonminify())
            .pipe(rename("manifest.json"))
            .pipe(gulp.dest("./dist"));
        return cb();
    }
}
exports.minifyManifest = minifyManifest([]);

function copyFont(exceptions) {
    return cb => {
        console.info(">>> minifyFont");
        gulp.src(["./fonts/*", ...exceptions])
            .pipe(gulp.dest("./dist/fonts"));
        return cb();
    }
}
exports.copyFont = copyFont([]);

function copyImg(exceptions) {
    return cb => {
        console.info(">>> copyImg");
        gulp.src(["./img/**/*", ...exceptions])
            .pipe(gulp.dest("./dist/img"));

        return cb();
    }
}
exports.copyLib = copyImg([]);

const copyAll = gulp.series([copyLib([]), copyFont([]), copyImg([])]);
exports.copyAll = copyAll;

const buildAll = gulp.series(minifyCss([]), minifyHtml([]), minifyJs([]), minifyManifest([]), copyAll);

exports.buildAll = buildAll;
exports.default = buildAll;

function deleteFileList(list) {
    gulp.src(list, { read: false, allowEmpty: true })
        .pipe(rm());
}

function finalizeChrome(cb) {
    deleteFileList([
        "./dist/manifest-firefox.json",
        "./dist/js/common/firefoxpatch.js",
        "./dist/css/styles-firefox.css",
        "./dist/css/option_styles-firefox.css",
        "./dist/html/option_page-firefox.html"
    ]);
    gulp.src("./dist/manifest-chrome.json", { read: false, allowEmpty: true })
        .pipe(rename("manifest.json"))
        .pipe(gulp.dest("./dist"));

    // make sure no double manifest files exist
    deleteFileList(["./dist/manifest-chrome.json"])

    minifyCss([
        "!css/styles-firefox.css",
        "!css/option_styles-firefox.css",
    ])(()=>{});
    minifyHtml([
        "!html/option_page-firefox.html"
    ])(()=>{});
    minifyJs([
        "!js/common/firefoxpatch.js",
    ])(()=>{});
    minifyManifest([
        "!manifest-firefox.json",
    ])(()=>{});

    return cb();
}
exports.chrome = gulp.series([copyAll, finalizeChrome]);

function finalizeFirefox(cb) {
    minifyCss([
        "!css/styles-chrome.css",
        "!css/option_styles-chrome.css",
    ])(()=>{});
    minifyHtml([
        "!html/option_page-chrome.html",
    ])(()=>{});
    minifyJs([
        "!js/common/chromepatch.js",
    ])(()=>{});
    minifyManifest([
        "!manifest-chrome.json",
    ])(()=>{});

    return cb();
}
exports.firefox = gulp.series([copyAll, finalizeFirefox]);

function cleanDist(cb) {
    gulp.src(["./dist/**/*"], { read: false, allowEmpty: true })
        .pipe(rm());
    return cb();
}
exports.cleanDist = cleanDist;

function cleanJs(cb) {
    gulp.src(["./js/**/*"], { read: false, allowEmpty: true })
        .pipe(rm());
    return cb();
}
exports.cleanJs = cleanJs;

exports.cleanAll = gulp.series([cleanDist, cleanJs])