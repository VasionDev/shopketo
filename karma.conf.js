// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: "",
    files: [
      "src/assets/js/jquery-3.4.1.min.js",
      "src/assets/js/bootstrap.min.js",
      "src/assets/js/drawer.min.js",
      "src/assets/js/script.js",
      "src/assets/js/slick.min.js",
      "src/assets/js/blog.js",
      "src/assets/js/aos.js",
      "src/assets/js/iscroll.min.js",
      "src/assets/js/popper.min.js",
      "src/assets/js/products-body.js",
      "src/assets/js/research.js",
      "src/assets/js/typetext.js",
    ],
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require("karma-coverage"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage-istanbul-reporter"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require("path").join(__dirname, "./coverage/ng-shopketo"),
      reports: ["html", "lcovonly", "text-summary"],
      fixWebpackSourcePaths: true,
    },
    reporters: ["progress", "kjhtml"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: false,
    restartOnFileChange: true,
  });
};
