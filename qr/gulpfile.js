const gulp = require('gulp');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');


var vendorFiles = [
        "lib/jsqrcode/src/grid.js",
        "lib/jsqrcode/src/version.js",
        "lib/jsqrcode/src/detector.js",
        "lib/jsqrcode/src/formatinf.js",
        "lib/jsqrcode/src/errorlevel.js",
        "lib/jsqrcode/src/bitmat.js",
        "lib/jsqrcode/src/datablock.js",
        "lib/jsqrcode/src/bmparser.js",
        "lib/jsqrcode/src/datamask.js",
        "lib/jsqrcode/src/rsdecoder.js",
        "lib/jsqrcode/src/gf256poly.js",
        "lib/jsqrcode/src/gf256.js",
        "lib/jsqrcode/src/decoder.js",
        "lib/jsqrcode/src/qrcode.js",
        "lib/jsqrcode/src/findpat.js",
        "lib/jsqrcode/src/alignpat.js",
        "lib/jsqrcode/src/databr.js"
    ],
    jsDest = './';

gulp.task('vendor', function() {
    return gulp.src(vendorFiles)
        .pipe(concat('vendors.js'))
        .pipe(gulp.dest(jsDest))
        .pipe(rename('vendors.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(jsDest));
});