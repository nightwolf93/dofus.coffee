module.exports = function(grunt) {
    grunt.initConfig({
        coffee: {
            compile: {
                files: {
                  'dist/dofus.js': ['src/*.coffee'] // compile and concat into single file
                }
            },
        },
        uglify: {
            prod: {
              files: {
                'dist/dofus.min.js': ['dist/dofus.js']
              }
            }
        },
        watch: {
            coffee: {
                files: ['src/*.coffee'],
                tasks: ['dev'],
                options: {
                    spawn: false,
                }
            },
      },
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('dev', ['coffee:compile', 'uglify:prod', 'watch']);
};
