exports.config = {
    directConnect:true,
    capabilities: {
      'browserName': 'chrome',
      'chromeOptions': {
         'args': ['show-fps-counter=true']
      }
   },
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['test-spec.js']
  };
  
  