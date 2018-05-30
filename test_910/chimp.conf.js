module.exports = {
  // - - - - CHIMP - - - -
  showXolvioMessages: false,
  // - - - - CUCUMBER - - - -
  path: 'test_910/features',
  chai: true,
  // - - - - WEBDRIVER-IO  - - - -
  webdriverio: {
    baseUrl: 'http://localhost:8080/nuxeo/',
    waitforTimeout: 5000,
    waitforInterval: 250,
    logOutput: 'target/wdio/',
    desiredCapabilities: {
      browserName: 'chrome',
      javascriptEnabled: true,
      acceptSslCerts: true,
      chromeOptions: {
        args: ['--no-sandbox']
      }
    },
    plugins: {
    'wdio-webcomponents': {}
    }
  },
};
