module.exports = {
  // - - - - CHIMP - - - -
  showXolvioMessages: false,
  // - - - - CUCUMBER - - - -
  path: 'test_910/features',
  chai: true,
  screenshotsOnError: true,
  screenshotsPath: 'ftest/target/screenshots',
  saveScreenshotsToDisk: true,
  captureAllStepScreenshots: true,
  jsonOutput: 'ftest/target/cucumber-reports/report.json',
  // - - - - WEBDRIVER-IO  - - - -
  webdriverio: {
    baseUrl: 'http://localhost:8080/nuxeo/',
    waitforTimeout: 30000,
    waitforInterval: 250,
    logOutput: 'ftest/target/wdio',
    plugins: {
    'wdio-webcomponents': {}
    }
  },
  desiredCapabilities: {
    browserName : 'chrome',
    javascriptEnabled : true,
    acceptSslCerts : true,
    chromeOptions : {
      args : ['--no-sandbox']
    }
  }
};
