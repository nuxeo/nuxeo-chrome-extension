exports.config = {

    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the directory
    // from which `wdio` was called. Notice that, if you are calling `wdio` from an
    // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
    // directory is where your package.json resides, so `wdio` will be called from there.
    //
    specs: [
        './test_1010/features/*.feature'
    ],
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    //
    // ============
    // Capabilities
    // ============
    // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
    // time. Depending on the number of capabilities, WebdriverIO launches several test
    // sessions. Within your capabilities you can overwrite the spec and exclude options in
    // order to group specific specs to a specific capability.
    //
    // First, you can define how many instances should be started at the same time. Let's
    // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
    // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
    // files and you set maxInstances to 10, all spec files will get tested at the same time
    // and 30 processes will get spawned. The property handles how many capabilities
    // from the same test should run tests.
    //
    maxInstances: 10,
    //
    // If you have trouble getting all important capabilities together, check out the
    // Sauce Labs platform configurator - a great tool to configure your capabilities:
    // https://docs.saucelabs.com/reference/platforms-configurator
    //
    capabilities: [{
        // maxInstances can get overwritten per capability. So if you have an in-house Selenium
        // grid with only 5 firefox instances available you can make sure that not more than
        // 5 instances get started at a time.
        maxInstances: 1,
        //
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        chromeOptions: {
          args: [
            '--no-sandbox',
            '--headless',
            '--disable-gpu',
            '--single-process',
            '--disable-dev-shm-usage',
            '--window-size=1920,1080'
          ],
        }
    }],
    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // By default WebdriverIO commands are executed in a synchronous way using
    // the wdio-sync package. If you still want to run your tests in an async way
    // e.g. using promises you can set the sync option to false.
    sync: true,
    //
    // Level of logging verbosity: silent | verbose | command | data | result | error
    logLevel: 'error',
    //
    // Enables colors for log output.
    coloredLogs: true,
    //
    // Warns when a deprecated command is used
    deprecationWarnings: false,
    //
    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,
    //
    // Saves a screenshot to a given path if a command fails.
    screenshotPath: './test_1010/screenshots/',
    //
    // Set a base URL in order to shorten url command calls. If your `url` parameter starts
    // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
    // gets prepended directly.
    baseUrl: 'http://localhost:8080/nuxeo',
    //
    // Default timeout for all waitFor* commands.
    waitforTimeout: 10000,
    //
    // Default timeout in milliseconds for request
    // if Selenium Grid doesn't send response
    connectionRetryTimeout: 90000,
    //
    // Default request retries count
    connectionRetryCount: 3,
    //
    // Initialize the browser instance with a WebdriverIO plugin. The object should have the
    // plugin name as key and the desired plugin options as properties. Make sure you have
    // the plugin installed before running any tests. The following plugins are currently
    // available:
    // WebdriverCSS: https://github.com/webdriverio/webdrivercss
    // WebdriverRTC: https://github.com/webdriverio/webdriverrtc
    // Browserevent: https://github.com/webdriverio/browserevent
    // plugins: {
    //     webdrivercss: {
    //         screenshotRoot: 'my-shots',
    //         failedComparisonsRoot: 'diffs',
    //         misMatchTolerance: 0.05,
    //         screenWidth: [320,480,640,1024]
    //     },
    //     webdriverrtc: {},
    //     browserevent: {}
    // },
    //
    // Test runner services
    // Services take over a specific job you don't want to take care of. They enhance
    // your test setup with almost no effort. Unlike plugins, they don't add new
    // commands. Instead, they hook themselves up into the test process.
    services: ['selenium-standalone'],
    // seleniumInstallArgs: {
    //   version : "3.141",
    //   baseURL : "https://selenium-release.storage.googleapis.com",
    //   drivers : {
    //     chrome : {
    //       version : "2.45",
    //       arch    : process.arch,
    //       baseURL : "https://chromedriver.storage.googleapis.com",
    //     }
    //   }
    // },
    //
    // Framework you want to run your specs with.
    // The following are supported: Mocha, Jasmine, and Cucumber
    // see also: http://webdriver.io/guide/testrunner/frameworks.html
    //
    // Make sure you have the wdio adapter package for the specific framework installed
    // before running any tests.
    framework: 'cucumber',
    //
    // Test reporter for stdout.
    // The only one supported by default is 'dot'
    // see also: http://webdriver.io/guide/reporters/dot.html
    reporters: ['spec', 'multiple-cucumber-html'],
    reporterOptions: {
      htmlReporter: {
        jsonFolder: './ftest/target/cucumber-reports',
        reportFolder: './ftest/target/cucumber-reports/html'
      }
    },
    //
    // If you are using Cucumber you need to specify the location of your step definitions.
    cucumberOpts: {
        require: ['./test_1010/features/step_definitions/*.js'],        // <string[]> (file/dir) require files before executing features
        backtrace: true,   // <boolean> show full backtrace for errors
        compiler: [],       // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
        dryRun: false,      // <boolean> invoke formatters without executing steps
        failFast: false,    // <boolean> abort the run on first failure
        format: ['pretty'], // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
        colors: true,       // <boolean> disable colors in formatter output
        snippets: true,     // <boolean> hide step definition snippets for pending steps
        source: true,       // <boolean> hide source uris
        profile: [],        // <string[]> (name) specify the profile to use
        strict: false,      // <boolean> fail if there are any undefined or pending steps
        tags: [],           // <string[]> (expression) only execute the features or scenarios with tags matching the expression
        timeout: 20000,     // <number> timeout for step definitions
        ignoreUndefinedDefinitions: false, // <boolean> Enable this config to treat undefined definitions as warnings.
    },

    //
    // =====
    // Hooks
    // =====
    // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
    // it and to build services around it. You can either apply a single function or an array of
    // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    /**
     * Gets executed once before all workers get launched.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    // onPrepare: function (config, capabilities) {
    // },
    /**
     * Gets executed just before initialising the webdriver session and test framework. It allows you
     * to manipulate configurations depending on the capability or spec.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    beforeSession: function (config, capabilities, specs) {
      const chrome = require('sinon-chrome');
      global.chrome = chrome;
      global.fixtures = {};
      global.liveDocuments = [];
      global.users = {
        Administrator: 'Administrator',
      };
      const Nuxeo = require('nuxeo');
      const nuxeo = new Nuxeo({
        baseURL: 'http://localhost:8080/nuxeo/',
        auth: {
          method: 'basic',
          username: 'Administrator',
          password: 'Administrator'
        }
      });
      const path = require('path');

      fixtures.documents = {
        init: (docType) => {
          const title = `My_${docType}`;
          const doc = {
            'entity-type': 'document',
            name: title.replace(/[^a-z0-9.]/gi, '_'),
            type: docType.trim(),
            properties: {
              'dc:title': title,
            },
          };
          return doc;
        },
        create: (parent, document) => nuxeo.repository().create(parent, document).then((doc) => {
          liveDocuments.push(doc.path);
          return doc;
        }),
        delete: docPath => nuxeo.repository().delete(docPath).then(() => {
          liveDocuments.splice(liveDocuments.indexOf(docPath), 1);
        }),
      };

      // Assume we are always working on localhost:8080
      chrome.tabs.query.yields([{
        url: 'http://localhost:8080/nuxeo/view_documents.faces?conversationId=0NXMAIN',
        id: 1
      }]);

    },
    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    // before: function (capabilities, specs) {
    // },
    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    // beforeCommand: function (commandName, args) {
    // },

    /**
     * Runs before a Cucumber feature
     * @param {Object} feature feature details
     */
    // beforeFeature: function (feature) {
    // },
    /**
     * Runs before a Cucumber scenario
     * @param {Object} scenario scenario details
     */
    beforeScenario: function (scenario) {
      /**
       * This function runs in the browser context
       * @param {string|Array<string>} selectors
       * @return {?Element}
       */
      function findInShadowDom(selectors) {
        let selectorsArray = [];
        if (!Array.isArray(selectors)) {
          selectorsArray = [selectors];
        } else {
          selectorsArray = selectors;
        }

        function findElement(selector) {
          let currentElement = document;
          for (let i = 0; i < selector.length; i += 1) {
            if (i > 0) {
              currentElement = currentElement.shadowRoot;
            }

            if (currentElement) {
              currentElement = currentElement.querySelector(selector[i]);
            }

            if (!currentElement) {
              break;
            }
          }

          return currentElement;
        }

        if (!(document.body.createShadowRoot || document.body.attachShadow)) {
          selectorsArray = [selectors.join(' ')];
        }
        return findElement(selectorsArray);
      }

      /**
       * Add a command to return an element within a shadow dom.
       * The command takes an array of selectors. Each subsequent
       * array member is within the preceding element's shadow dom.
       *
       * Example:
       *
       *     const elem = browser.shadowDomElement(['foo-bar', 'bar-baz', 'baz-foo']);
       *
       * Browsers which do not have native ShadowDOM support assume each selector is a direct
       * descendant of the parent.
       */
      try {
        browser.addCommand('shadowDomElement', function (selector) {
          return this.execute(findInShadowDom, selector);
        });
      } catch(e){};

      /**
       * Provides the equivalent functionality as the above shadowDomElement command, but
       * adds a timeout. Will wait until the selectors match an element or the timeout
       * expires.
       *
       * Example:
       *
       *     const elem = browser.waitForShadowDomElement(['foo-bar', 'bar-baz', 'baz-foo'], 2000);
       */
      try {
        browser.addCommand('waitForShadowDomElement', function async(selector, timeout, timeoutMsg, interval) {
          return this.waitUntil(() => {
            const elem = this.execute(findInShadowDom, selector);
            return elem && elem.value;
          }, timeout, timeoutMsg, interval);
        });
      } catch(e){};

      const Nuxeo = require('nuxeo');
      const nuxeo = new Nuxeo({
        baseURL: 'http://localhost:8080/nuxeo/',
        auth: {
          method: 'basic',
          username: 'Administrator',
          password: 'Administrator'
        }
      });
      return nuxeo.repository()
        .fetch('/default-domain')
        .then((doc) => { this.doc = doc; });
    },
    /**
     * Runs before a Cucumber step
     * @param {Object} step step details
     */
    // beforeStep: function (step) {
    // },
    /**
     * Runs after a Cucumber step
     * @param {Object} stepResult step result
     */
    // afterStep: function (stepResult) {
    // },
    /**
     * Runs after a Cucumber scenario
     * @param {Object} scenario scenario details
     */
    afterScenario: function (scenario) {
      // Close extra tabs
      const tabIds = browser.getTabIds();
      if (tabIds.length > 2) {
        for (let i = 2; i < tabIds.length; i += 1) {
          browser.switchTab(tabIds[i]);
          browser.close();
        }
      }

      // Delete all documents
      const path = require('path');
      const Nuxeo = require('nuxeo');
      const nuxeo = new Nuxeo({
        baseURL: 'http://localhost:8080/nuxeo/',
        auth: {
          method: 'basic',
          username: 'Administrator',
          password: 'Administrator'
        }
      });
      const userWorkspaces = '/default-domain/UserWorkspaces/';
      return Promise.all(liveDocuments
        .filter(doc => path.dirname(doc) === '/default-domain')
        .map(doc => {
          nuxeo.repository().delete(doc);
        }))
        .then(() => {
          liveDocuments = [];
        })
        .then(() => {
          return nuxeo.repository().delete(userWorkspaces).catch(() => {});
        });
    },
    /**
     * Runs after a Cucumber feature
     * @param {Object} feature feature details
     */
    // afterFeature: function (feature) {
    // },

    /**
     * Runs after a WebdriverIO command gets executed
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     * @param {Number} result 0 - command success, 1 - command error
     * @param {Object} error error object if any
     */
    // afterCommand: function (commandName, args, result, error) {
    // },
    /**
     * Gets executed after all tests are done. You still have access to all global variables from
     * the test.
     * @param {Number} result 0 - test pass, 1 - test fail
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // after: function (result, capabilities, specs) {
    // },
    /**
     * Gets executed right after terminating the webdriver session.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // afterSession: function (config, capabilities, specs) {
    // },
    /**
     * Gets executed after all workers got shut down and the process is about to exit.
     * @param {Object} exitCode 0 - success, 1 - fail
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    // onComplete: function(exitCode, config, capabilities) {
    // }
}
