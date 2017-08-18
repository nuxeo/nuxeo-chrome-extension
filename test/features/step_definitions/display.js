import nuxeo from './support/services/client';

module.exports = function () {
  function injectMocks() {
    return browser.execute(() => {
      chrome.tabs.create.callsFake((opts) => {
        // window.document.location = opts.url;
        window.open(opts.url);
      });
    });
  }

  this.Given(/^the (.+) page is open(?: on ([Ff]irefox|[Cc]hrome))?/, (page, arg) => {
    // Object.keys(global).forEach(k => console.log(k));
    const dist = arg || 'sinon-chrome';

    // Open Popup in the current Window
    const url = `file://${__dirname}/../../../dist/${dist.toLowerCase()}/${page.toLowerCase()}.html`;
    browser.url(url);
    // http://chaijs.com/api/bdd/
    if (page === 'Popup') {
      expect(browser.getTitle()).to.equal('Nuxeo Dev Tools');
      injectMocks();
    } else {
      expect(browser.execute(() => {
        getCurrentTabUrl(() => {});
        return window.studioExt.server.url;
      }).value).to.be.equal('http://localhost:8080/nuxeo/');
      expect(browser.getTitle()).to.equal(`${page} - Nuxeo Dev Tools`);
      injectMocks();
    }
    let tabIds = browser.getTabIds();
    if (tabIds.length === 1) {
      browser.execute(() => {
        window.open('http://localhost:8080/nuxeo');
      });
      tabIds = browser.getTabIds();
      browser.switchTab(tabIds[1]);
      browser.$('#username').waitForVisible();
      browser.$('#username').addValue('Administrator');
      browser.$('#password').addValue('Administrator');
      browser.$('input.login_button').click();
      browser.switchTab(tabIds[0]);
    }
  });

  this.When('I enter $text in $selector input', (text, selector) => {
    browser.$(`#${selector}`).addValue(text);
    // Wait until debouncing is ok
    browser.waitForVisible('#loading-gif');
    browser.screenshot();
    browser.waitForVisible('#loading-gif', 2000, true);
  });

  this.Then('I wait until $selector appears', (selector) => {
    browser.waitForExist(`${selector} > *`);
    browser.screenshot();
  });

  this.Then('I see $url as the connected server', (url) => {
    // Check url on popup
    expect(url).to.be.a('string');
    expect(browser.$('.server-name-url').getText()).to.equal(url);
  });

  this.Then(/the server responds with (\d+) documents?/, (size) => {
    expect(browser.$('#search-results').$$('.search-result').length).to.equal(Number.parseInt(size));
  });

  this.Then(/the #(\d+) document title is (.+) and the parent path is (.+)/, (index, title, parentPath) => {
    const trs = browser.$$('#search-results tbody tr');
    const trTitle = trs[index - 1];
    const trPath = trs[index];

    expect(trTitle.$('.doc-title').getText()).to.equal(title);
    expect(trPath.$('.doc-path').getText()).to.equal(parentPath);
  });

  this.When(/^I (see|click on) the (.+) (link|button|element)/, (action, selector, element) => {
    selector = selector.replace(/\s+/g, '-').toLowerCase();
    if (element === 'button') {
      selector = `${selector}-button`;
    }
    browser.waitForVisible(`#${selector}`);
    if (action === 'click on') {
      browser.$(`#${selector}`).click();
      if (!(browser.execute(() => chrome.tabs.create.called).value)) {
        expect(browser.execute(() => {
          getCurrentTabUrl(() => {});
          return window.studioExt.server.url;
        }).value).to.be.equal('http://localhost:8080/nuxeo/');
        injectMocks();
      }
    }
  });

  this.When(/^I hover on the (.+) element/, (element) => {
    const selector = element.replace(/\s+/g, '-').toLowerCase();
    browser.waitForVisible(`#${selector}`).should.be.true;
    browser.moveToObject(`#${selector}`);
    if (selector === 'useful-links') {
      browser.waitForVisible('#dropdown-content');
    }
  });

  this.Then('the $title page opens', (title) => {
    const tabIds = browser.getTabIds();
    browser.switchTab(tabIds[2]);
    browser.waitUntil(() => browser.getTitle() === title);
  });

  this.Then(/I am taken to the (.+ )?popup/, (popup) => {
    let title = '';
    if (popup) {
      title = `${popup}- `;
    }
    expect(browser.getTitle()).to.equal(`${title}Nuxeo Dev Tools`);
  });

  this.Then('I see the version number', () => {
    browser.waitForVisible('#version');
    expect(browser.$('#version').getText().length).to.be.at.least(5);
  });

  this.Then('the copyright is up-to-date', () => {
    const date = new Date().getFullYear();
    browser.waitForVisible('#copyright');
    expect(browser.$('#copyright').getText()).to.include(date);
  });

  this.Then('I am connected to API Playground on $server', (server) => {
    browser.waitForVisible('::shadow div.connection a');
    expect(browser.$('::shadow div.connection a').getText()).to.equal(server);
  });

  this.Then('I see the confirmation dialog', () => {
    browser.waitForVisible('div.confirmation-modal');
  });

  this.When('I confirm the dialog', () => {
    browser.$('button.confirm').click();
  });

  this.Then('the server restarts', () => {
    let connected = true;
    while (connected) {
      browser.pause(500);
      nuxeo.connect()
        .then(client => {
          connected = client.connected;
        })
        .catch(() => {
          connected = false;
        });
    }
    while (!connected) {
      browser.pause(500);
      nuxeo.connect()
        .then(client => {
          connected = client.connected;
        })
        .catch(() => {
          connected = false;
        })
        .done();
    }
  });

  this.Then('I can log back into Nuxeo', () => {
    browser.timeouts('implicit', 30000);
    const tabIds = browser.getTabIds();
    browser.switchTab(tabIds[1]);
    browser.pause(10000);
    browser.refresh();
    browser.$('#username').waitForVisible();
    browser.$('#username').addValue('Administrator');
    browser.$('#password').addValue('Administrator');
    browser.$('input.login_button').click();
    browser.switchTab(tabIds[0]);
    browser.refresh();
  });

  this.Then(/^traces are (enabled|disabled)/, (mode) => {
    const enabled = browser.$('#automation-call-tracing-toggle').getAttribute('checked');
    if (mode === 'enabled') {
      if (enabled === null) {
        toggleTraces('Popup');
      }
      tracesEnabled('Popup').should.be.true;
    } else {
      if (enabled === 'true') {
        toggleTraces('Popup');
      }
      tracesEnabled('Popup').should.be.false;
    }
  });

  this.Then(/^I can see that traces are (enabled|disabled) on the (Automation Documentation|Popup) page/, (mode, page) => {
    if (page === 'Nuxeo Dev Tools') {
      if (mode === 'enabled') {
        tracesEnabled(page).should.be.true;
      } else {
        tracesEnabled('Popup').should.be.false;
      }
    } else if (mode === 'enabled') {
      browser.$('//a[text()="Disable"]').waitForVisible;
    } else {
      browser.$('//a[text()="Enable"]').waitForVisible;
    }
  });

  this.Then('I click on the $operation operation', (operation) => {
    const tabIds = browser.getTabIds();
    browser.switchTab(tabIds[2]);
    browser.$(`//a[text()="${operation}"]`).waitForVisible;
    browser.$(`//a[text()="${operation}"]`).click();
  });

  this.When(/^I (enable|diasable) traces from the (Automation Documentation|Popup) page$/, (action, page) => {
    if ((tracesEnabled(page) && action === 'disable') || (!tracesEnabled(page) && action === 'enable')) {
      toggleTraces(page);
    }
  });

  this.When(/^I go to the (.+) page$/, (page) => {
    const tabIds = browser.getTabIds();
    if (page === 'Popup') {
      page = 'Nuxeo Dev Tools';
    }
    for (let i = 0; i < tabIds.length; i += 1) {
      if (page !== browser.getTitle()) {
        browser.switchTab(tabIds[i]);
      } else {
        return;
      }
    }
  });
};
