var HtmlReporter = require('protractor-beautiful-reporter');
exports.config = {
    directConnect:true,
    capabilities: {
      'browserName': 'chrome',
      'chromeOptions': {
         'args': ['show-fps-counter=true']
      }
   },
    framework: 'jasmine',
    onPrepare: function(){
      
      // jasmine.getEnv().addReporter(new HtmlReporter({
      //    baseDirectory: 'reports_new',
      //    screenshotsSubfolder: 'screenshotsOnFailure',
      //    takeScreenShotsOnlyForFailedSpecs: false,
      //    jsonsSubfolder: 'jsonFiles',
      //    excludeSkippedSpecs: true,
      //    preserveDirectory: false,
      //    clientDefaults:{
      //    showTotalDurationIn: "header",
      //    totalDurationFormat: "h:m:s",
      //    gatherBrowserLogs: true
      //  },
      // }).getJasmine2Reporter());
       
      //Getting CLI report
            const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
            jasmine.getEnv().addReporter(new SpecReporter({
            spec: {
              displayStacktrace: true
            }
          }));
      //Getting XML report
          var jasmineReporters = require('jasmine-reporters');
          jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
             consolidateAll: true,
             filePrefix: 'guitest-xmloutput',
             savePath: '.'
          }));
      //Getting screenshots
        var fs = require('fs-extra');
          fs.emptyDir('screenshots/', function (err) {
                   console.log(err);
               });
               jasmine.getEnv().addReporter({
                   specDone: function(result) {
                       if (true) {
                           browser.getCapabilities().then(function (caps) {
                               var browserName = caps.get('browserName');
                               browser.takeScreenshot().then(function (png) {
                                   var stream = fs.createWriteStream('screenshots/' + browserName + '-' + result.fullName+ '.png');
                                   stream.write(new Buffer.from(png, 'base64'));
                                   stream.end();
                               });
                           });
                       }
                   }
               });
         
         

      },
        onComplete: function() {
      //Getting HTML report
      var browserName, browserVersion;
           var capsPromise = browser.getCapabilities();
           capsPromise.then(function (caps) {
              browserName = caps.get('browserName');
              browserVersion = caps.get('version');
              platform = caps.get('platform');
              var HTMLReport = require('protractor-html-reporter-2');
              testConfig = {
                  reportTitle: 'Protractor Test Execution Report',
                  outputPath: './',
                  outputFilename: 'ProtractorTestReport',
                  screenshotPath: './screenshots',
                  testBrowser: browserName,
                  browserVersion: browserVersion,
                  modifiedSuiteName: false,
                  screenshotsOnlyOnFailure: true,
                  testPlatform: platform
              };
              new HTMLReport().from('guitest-xmloutput.xml', testConfig);
          });
        },
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['test-spec.js']
    
  };
  
  