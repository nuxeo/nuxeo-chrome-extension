// generated on 2016-03-11 using generator-chrome-extension 0.5.4
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import {
  stream as wiredep
} from 'wiredep';
import es from 'event-stream';
import fs from 'fs';
import concat from 'gulp-concat';
import path from 'path';
import util from 'gulp-util';
import moment from 'moment';
import cheerio from 'gulp-cheerio';
import filter from 'gulp-filter';
import debug from 'gulp-debug';
import eslint from 'gulp-eslint';

const $ = gulpLoadPlugins();
let version = '';

function pipe(src, transforms, dest) {
  if (typeof transforms === 'string') {
    dest = transforms;
    transforms = null;
  }

  var stream = gulp.src(src);
  transforms && transforms.forEach(function (transform) {
    stream = stream.pipe(transform);
  });

  if (dest) {
    stream = stream.pipe(gulp.dest(dest));
  }

  return stream;
}

// Create WIP build bersion based on date and time
let buildNumber = (() => {
  // Ensure build number is the same if FF and Chrome are built together.
  let build = moment.utc().format('DDMM.HHmm');
  return function () {
    return build;
  }
})();

// Get version from manifest
function readVersion(vendor) {
  let manifest = require(`./app/vendor/${vendor}/manifest.json`);
  return manifest.version.split('\.');
}

// Increment build version
let buildVersion = function (vendor) {
  let [major, minor, build] = readVersion(vendor);
  return `${major}.${minor}.${buildNumber()}`
}

// Increment minor version
let minorVersion = function (vendor) {
  let [major, minor, build] = readVersion(vendor);
  return `${major}.${parseInt(minor) + 1}.0`;
}

// Increment major version
let majorVersion = function (vendor) {
  let [major, minor, build] = readVersion(vendor);
  return `${parseInt(major) + 1}.0.0`;
}

function updateVersionForRelease(vendor, version, distFile) {

  util.log(`Releasing ${vendor} Extension: ${version}`);
  // Update sources Manifest
  gulp.src(`app/vendor/${vendor}/manifest.json`)
    .pipe($.chromeManifest({
      buildnumber: version
    }))
    .pipe(gulp.dest(`app/vendor/${vendor}`));

  gulp.src(`dist/${vendor}/manifest.json`)
    .pipe($.chromeManifest({
      buildnumber: version,
      background: {
        target: 'scripts/background.js'
      }
    }))
    .pipe(gulp.dest(dist(vendor)));
}

function lint(files) {
  try {
    fs.mkdirSync('ftest/target');
    fs.writeFileSync('ftest/target/checkstyle-result.xml');
  }
  catch(err) {}
  finally {
    return () => {
      return gulp.src(files)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.format('checkstyle', fs.createWriteStream('ftest/target/checkstyle-result.xml')));
    };
  }
}

function dist(vendor, name) {
  return path.join('dist', vendor || 'base', name || '');
}

function prependScript(node, file) {
  node.prepend(`<script src="${file}"></script>`);
}

gulp.task('lint', lint([
  'app/scripts.babel/*.js',
  'app/vendor.babel/**/*.js',
  'test/features/step_definitions/*.js',
  'test/features/step_definitions/support/**/*.js',
]));

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/_locales/**',
    'app/libs/**',
    '!app/vendor.babel',
    '!app/scripts.babel',
    '!app/*.json',
    '!app/*.html',
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest(dist()));
});

gulp.task('scripts', () => {
  return gulp.src('app/scripts.babel/*.js')
    .pipe(gulp.dest(dist('base/scripts')));
});

gulp.task('styles', () => {
  return gulp.src('app/styles/*.css')
    .pipe(gulp.dest(dist('base/styles')));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
        progressive: true,
        interlaced: true,
        // don't remove IDs from SVGs, they are often used
        // as hooks for embedding and styling
        svgoPlugins: [{
          cleanupIDs: false
        }]
      }))
      .on('error', function (err) {
        console.log(err);
        this.end();
      })))
    .pipe(gulp.dest(dist('base', 'images')));
});

gulp.task('vendor:chrome', ['babel'], () => {
  return es.merge(
    pipe('app/vendor/chrome/browser.js', dist('chrome', 'scripts'))
  );
});

gulp.task('vendor:firefox', ['babel'], () => {
  return es.merge(
    pipe('app/vendor/firefox/browser.js', dist('firefox', 'scripts'))
  );
});

gulp.task('html', ['vendor:chrome', 'vendor:firefox'], () => {
  return gulp.src('app/*.html')
    .pipe(gulp.dest(dist()));
});

gulp.task('build:chrome', ['build:base'], (done) => {
  if (version.length < 1) {
    version = buildVersion('chrome');
  }
  gulp.src(dist('base', '**/*'))
    .pipe(filter(['**', '!**/about.html']))
    .pipe(gulp.dest(dist('chrome')));

  gulp.src(dist('base', 'about.html'))
    .pipe(cheerio(($) => {
      const date = new Date().getFullYear();
      $('#copyright').append(`${date} Nuxeo`);
      $('#version').text(`Version ${version}`);
    }))
    .pipe(gulp.dest(dist('chrome')));

  util.log(`Building Chrome Extension: ${version}`);

  gulp.src('app/vendor/chrome/manifest.json')
    .pipe($.chromeManifest({
      buildnumber: version,
      background: {
        target: 'scripts/background.js'
      }
    }))
    .pipe(gulp.dest(dist('chrome')));

  return runSequence('size', done);
});

gulp.task('build:sinon-chrome', ['build:chrome'], () => {
  if (version.length < 1) {
    version = buildVersion('sinon-chrome');
  }
  const target = 'sinon-chrome';
  // Copy Chrome build
  gulp.src(dist('chrome', '**/*'))
    .pipe(filter(['**', '!**/popup.html']))
    .pipe(filter(['**', '!**/about.html']))
    .pipe(filter(['**', '!**/es-reindex.html']))
    .pipe(gulp.dest(dist(target)));

  // Add sinon-chrome.min script
  gulp.src(require.resolve('sinon-chrome/bundle/sinon-chrome.min.js'))
    .pipe(gulp.dest(dist(target, 'scripts')))

  // Transpile and Copy injecter.js script
  // gulp.src(path.join(__dirname, 'test', 'injecter.js'))
  gulp.src(path.join('test', 'injecter.js'))
    .pipe($.babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest(dist(target, 'scripts')));

  // Create a standalone index.html with background.js, sinon-chrome and a script injecter to manipulate mocks from Webdriverio.
  gulp.src(dist('chrome', 'popup.html'))
    .pipe(cheerio(($) => {
      const $head = $('head');
      // !! Order matters; as we use `prepend`, last added will be first.
      prependScript($head, 'scripts/background.js');
      prependScript($head, 'scripts/injecter.js')
      prependScript($head, 'scripts/sinon-chrome.min.js');
    }))
    .pipe(gulp.dest(dist(target)));

  gulp.src(dist('chrome', 'about.html'))
    .pipe(cheerio(($) => {
      const $head = $('head');
      // !! Order matters; as we use `prepend`, last added will be first.
      prependScript($head, 'scripts/background.js');
      prependScript($head, 'scripts/injecter.js')
      prependScript($head, 'scripts/sinon-chrome.min.js');
      const date = new Date().getFullYear();
      $('#version').text(`Version ${version}`);
    }))
    .pipe(gulp.dest(dist(target)));

  gulp.src(dist('chrome', 'es-reindex.html'))
    .pipe(cheerio(($) => {
      const $head = $('head');
      // !! Order matters; as we use `prepend`, last added will be first.
      prependScript($head, 'scripts/background.js');
      prependScript($head, 'scripts/injecter.js')
      prependScript($head, 'scripts/sinon-chrome.min.js');
    }))
    .pipe(gulp.dest(dist(target)));
});

gulp.task('build:firefox', ['build:base', 'vendor:firefox'], (done) => {
  if (version.length < 1) {
    version = buildVersion('firefox');
  }
  gulp.src(dist('base', '**/*'))
    .pipe(filter(['**', '!**/about.html']))
    .pipe(gulp.dest(dist('firefox')));

  gulp.src(dist('base', 'about.html'))
    .pipe(cheerio(($) => {
      const date = new Date().getFullYear();
      $('#copyright').append(`${date} Nuxeo`);
      $('#version').text(`Version ${version}`);
    }))
    .pipe(gulp.dest(dist('firefox')));

  util.log(`Building Firefox Extension: ${version}`);

  gulp.src('app/vendor/firefox/manifest.json')
    .pipe($.chromeManifest({
      buildnumber: version,
      background: {
        target: 'scripts/background.js'
      }
    }))
    .pipe(gulp.dest(dist('firefox')));

  return runSequence('size', done);
});

gulp.task('release:chrome', ['build:chrome'], (cb) => {
  updateVersionForRelease('chrome', version);
  return runSequence('zip:chrome', cb);
});

gulp.task('release:firefox', ['build:firefox'], (cb) => {
  updateVersionForRelease('firefox');
  return runSequence('zip:firefox', cb);
});

gulp.task('babel', ['lint'], (cb) => {
  return runSequence('babel:base', 'babel:vendor', cb);
});

gulp.task('babel:bkg', () => {
  return gulp.src('app/scripts.babel/bkg/*.js')
  .pipe(concat('bkg.js'))
  .pipe($.babel({
    presets: ['es2015']
  }))
  .pipe(gulp.dest('app/scripts'));
});

gulp.task('babel:base', ['babel:bkg'], () => {
  return gulp.src('app/scripts.babel/*.js')
    .pipe($.babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('babel:vendor', ['babel:vendor:chrome', 'babel:vendor:firefox', 'manifest']);

gulp.task('babel:vendor:firefox', () => {
  return gulp.src('app/vendor.babel/firefox/*.js')
    .pipe($.babel({
      presets: ['es2015']
    })).pipe(gulp.dest('app/vendor/firefox'));
});

gulp.task('babel:vendor:chrome', () => {
  return gulp.src('app/vendor.babel/chrome/*.js')
    .pipe($.babel({
      presets: ['es2015']
    })).pipe(gulp.dest('app/vendor/chrome'));
});

gulp.task('manifest', ['manifest:firefox', 'manifest:chrome']);

gulp.task('manifest:firefox', () => {
  return gulp.src('app/vendor.babel/firefox/manifest.json')
    .pipe(gulp.dest('app/vendor/firefox'));
});

gulp.task('manifest:chrome', () => {
  return gulp.src('app/vendor.babel/chrome/manifest.json')
    .pipe(gulp.dest('app/vendor/chrome'))
});

gulp.task('clean', () => {
  return del.sync(['.tmp', 'dist', 'package', 'app/scripts', 'app/vendor']);
});

gulp.task('watch', ['build'], () => {
  $.livereload.listen();

  gulp.watch('app/scripts.babel/*.js', ['html']);
  gulp.watch('app/vendor.babel/**/*.js', ['vendor:chrome', 'vendor:firefox']);
  gulp.watch([
    'app/*.html',
    'app/libs/**/*.js',
    'app/images/**/*',
    'app/styles/**/*',
    'app/_locales/**/*.json'
  ]).on('change', function () {
    gulp.start('build:chrome');
    $.livereload.reload;
  });
  gulp.watch([
    'app/scripts/**/*.js',
    'app/vendor/**/*'
  ]).on('change', function () {
    $.livereload.reload;
  });
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe($.size({
    title: 'build',
    gzip: true
  }));
});

gulp.task('wiredep', () => {
  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app/chrome'))
    .pipe(gulp.dest('app/firefox'));
});

gulp.task('zip:chrome', () => {
  let filename = `BrowserDeveloperExtension-Chrome-${version}.zip`;
  util.log(`Building file: ${filename}`);
  return gulp.src(dist('chrome', '**'))
    .pipe($.zip(filename))
    .pipe(gulp.dest('package/chrome'));
});

gulp.task('zip:firefox', () => {
  let filename = `BrowserDeveloperExtension-Firefox-${version}.zip`;
  util.log(`Building file: ${filename}`);
  return gulp.src(dist('firefox', '**'))
    .pipe($.zip(filename))
    .pipe(gulp.dest('package/firefox'));
});

gulp.task('package:chrome', (done) => {
  return runSequence('build:chrome', 'zip:chrome', done);
});

gulp.task('package:firefox', (done) => {
  return runSequence('build:firefox', 'zip:firefox', done);
});

gulp.task('base', () => {
  gulp.src(dist('base', '**/*'))
    .pipe(gulp.dest(dist('firefox')))
    .pipe(gulp.dest(dist('chrome')));
});

gulp.task('build:base', ['images', 'extras', 'scripts', 'styles', 'html']);

gulp.task('default', ['clean', 'build']);
gulp.task('build', ['build:chrome', 'build:firefox', 'build:sinon-chrome']);
gulp.task('package', ['package:chrome', 'package:firefox']);
gulp.task('release', () => {
  version = minorVersion('chrome');
  return runSequence(['release:chrome', 'release:firefox']);
});
gulp.task('release:major', () => {
  version = majorVersion('chrome');
  return runSequence(['release:chrome', 'release:firefox']);
});
