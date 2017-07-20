// generated on 2016-03-11 using generator-chrome-extension 0.5.4
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import {stream as wiredep} from 'wiredep';
import es from 'event-stream';
import concat from 'gulp-concat';
import path from 'path';
import util from 'gulp-util';
import moment from 'moment';

const $ = gulpLoadPlugins();

function pipe(src, transforms, dest) {
	if (typeof transforms === 'string') {
		dest = transforms;
		transforms = null;
	}

	var stream = gulp.src(src);
	transforms && transforms.forEach(function(transform) {
		stream = stream.pipe(transform);
	});

	if (dest) {
		stream = stream.pipe(gulp.dest(dest));
	}

	return stream;
}

let buildNumber = (() => {
  // Ensure build number is the same if FF and Chrome are built together.
  let build = moment.utc().format('DDDDHH');
  return function() {
    return build;
  }
})();

let releaseVersion = function(vendor) {
  let [major, minor, build] = readVersion(vendor);
  getVersion = releaseVersion;
  return `${major}.${parseInt(minor) + 1}.0`;
}

let buildVersion = function(vendor) {
  let [major, minor, build] = readVersion(vendor);
  return `${major}.${minor}.${buildNumber()}`
}

let getVersion = buildVersion

function readVersion(vendor) {
  let manifest = require(`./app/vendor/${vendor}/manifest.json`);
  return manifest.version.split('\.');
}

function updateVersionForRelease(vendor, distFile) {
  let version = releaseVersion(vendor);

  util.log(`Releasing ${vendor} Extension: ${version}`);
  // Update sources Manifest
  gulp.src(`app/vendor/${vendor}/manifest.json`)
    .pipe($.chromeManifest({
      buildnumber: version
		}))
    .pipe(gulp.dest(`app/vendor/${vendor}`));

	gulp.src(`app/vendor/${vendor}/manifest.json`)
    .pipe($.chromeManifest({
      buildnumber: version,
      background: {
				target: 'scripts/background.js'
			}
		}))
    .pipe(gulp.dest(dist(vendor)));
}

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe($.eslint(options))
      .pipe($.eslint.format());
  };
}

function dist(vendor, name) {
  return path.join('dist', vendor || 'base', name || '');
}

gulp.task('lint', lint('app/scripts.babel/**/*.js', {
  env: {
    es6: true
  }
}));

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/_locales/**',
    'app/libs/**',
    '!app/scripts.babel',
    '!app/*.json',
    '!app/*.html',
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest(dist()));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest(dist('base', 'images')));
});

gulp.task('vendor:chrome', () => {
  return es.merge(
    pipe('app/vendor/chrome/browser.js', dist('chrome', 'scripts'))
  );
});

gulp.task('vendor:firefox', () => {
  return es.merge(
    pipe('app/vendor/firefox/browser.js', dist('firefox', 'scripts'))
  );
});

gulp.task('html',  () => {
  return gulp.src('app/*.html')
    .pipe($.sourcemaps.init())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    .pipe($.sourcemaps.write())
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest(dist()));
	});

gulp.task('release:chrome', ['build:chrome'], (cb) => {
  updateVersionForRelease('chrome');
  return runSequence('zip:chrome', cb);
});

gulp.task('release:firefox', ['build:firefox'], (cb) => {
  updateVersionForRelease('firefox');
  return runSequence('zip:firefox', cb);
});

gulp.task('babel', () => {
  return gulp.src('app/scripts.babel/**/*.js')
      .pipe($.babel({
        presets: ['es2015']
      }))
      .pipe(gulp.dest('app/scripts'));
});

gulp.task('clean', () => {
  return del.sync(['.tmp', 'dist', 'package']);
});

gulp.task('watch', ['lint', 'babel', 'html', 'vendor:chrome', 'vendor:firefox', 'extras'], () => {
  $.livereload.listen();

	gulp.src('app/vendor/chrome/manifest.json')
		.pipe($.chromeManifest({
			background: {
				target: 'scripts/background.js'
			}
		}))
	.pipe(gulp.dest(dist('chrome')));

	gulp.src('app/vendor/firefox/manifest.json')
		.pipe($.chromeManifest({
			background: {
				target: 'scripts/background.js'
			}
		}))
	.pipe(gulp.dest(dist('firefox')));

  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/libs/**/*.js',
    'app/images/**/*',
    'app/styles/**/*',
    'app/_locales/**/*.json',
    'app/vendor/**/*'
  ]).on('change', function() {
		gulp.start('build');
		$.livereload.reload;
	});

  gulp.watch('app/scripts.babel/**/*.js', ['lint', 'babel']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
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
  let filename = `BrowserDeveloperExtension-Chrome-${getVersion('chrome')}.zip`;
  util.log(`Building file: ${filename}`);
  return gulp.src(dist('chrome', '**'))
      .pipe($.zip(filename))
      .pipe(gulp.dest('package/chrome'));
});
gulp.task('zip:firefox', () => {
  let filename = `BrowserDeveloperExtension-Firefox-${getVersion('firefox')}.zip`;
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

gulp.task('build:base', ['lint', 'babel', 'html', 'images', 'extras']);

gulp.task('build:chrome', ['build:base', 'vendor:chrome'], (done) => {
  gulp.src(dist('base', '**/*'))
    .pipe(gulp.dest(dist('chrome')));

  let version = getVersion('chrome');
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

gulp.task('build:firefox', ['build:base', 'vendor:firefox'], (done) => {
  gulp.src(dist('base', '**/*'))
    .pipe(gulp.dest(dist('firefox')));

  let version = getVersion('firefox');
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

gulp.task('default', ['clean', 'build']);
gulp.task('build',   ['build:chrome', 'build:firefox']);
gulp.task('package', ['package:chrome', 'package:firefox']);
gulp.task('release', ['release:chrome', 'release:firefox']);