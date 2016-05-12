'use strict';

import gulp from 'gulp';
import webpackStream  from 'webpack-stream';
import nodemon from 'gulp-nodemon';
import babel from 'gulp-babel';

gulp.task('build', ['build-client', 'build-server']);

gulp.task('build-client', ['copy-assets', 'build-shared'], () =>
    gulp.src('src/client/js/client.js')
        .pipe(webpackStream(require('./webpack.config.js')))
        .pipe(gulp.dest('dist/client/js'))
);

gulp.task('copy-assets', () =>
    gulp.src(['src/client/**/*.*', '!src/client/js/**/*.*'])
    .pipe(gulp.dest('dist/client/'))
);

gulp.task('build-server', ['build-shared'], () =>
    gulp.src(['src/server/**/*.*'])
    .pipe(babel())
    .pipe(gulp.dest('dist/server/'))
);

gulp.task('build-shared', () =>
    gulp.src(['src/shared/**/*.*'])
        .pipe(babel())
        .pipe(gulp.dest('dist/shared/'))
);

gulp.task('watch', ['build'], () => {
    gulp.watch(['src/client/**/*.*'], ['build-client']);
    gulp.watch(['src/server/**/*.*'], ['build-server']);
    gulp.watch(['src/shared/**/*.*'], ['build-server', 'build-client']);
    gulp.start('run');
});

gulp.task('run', () => {
    nodemon({
        delay: 10,
        script: 'dist/server/server.js',
        // args: ["config.json"],
        ext: 'js',
        watch: 'src'
    })
});

gulp.task('default', ['build', 'run']);