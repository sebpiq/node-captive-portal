module.exports = function(grunt) {

  grunt.initConfig({
    clean: {
      build: ['pages/build']
    },

    browserify: {
      build: {
        expand: true,
        cwd: 'pages/',
        src: ['**/*.js', '!build/**'],
        dest: 'pages/build/'
      }      
    },

    uglify: {
      build: {
        expand: true,
        cwd: 'pages/build',
        src: '**/*.js',
        dest: 'pages/build'
      }
    },

    copy: {
      build: {
        expand: true,
        cwd: 'pages/',
        src: ['**/*.html', '!build/**'],
        dest: 'pages/build/'
      }
    },

    inline: {
      build: {
        options:{
          tag: ''
        },
        expand: true,
        cwd: 'pages/build',
        src: '**/*.html',
        dest: 'pages/build'
      }
    }

  })

  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-inline')
  grunt.loadNpmTasks('grunt-contrib-clean')

  grunt.registerTask('default', ['browserify', 'copy', 'uglify', 'inline'])

}