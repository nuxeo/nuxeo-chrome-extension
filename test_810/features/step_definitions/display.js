const { Given, Then, When } = require('cucumber');
const chrome = require('sinon-chrome');
const chai = require('chai');

const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

function injectMocks() {
  return browser.execute(() => {
    chrome.tabs.create.callsFake((opts) => {
      window.open(opts.url);
    });
    chrome.storage.sync.get.callsFake(() => {
      window.open('https://connect.nuxeo.com/nuxeo/site/studio/ide?project=bde-test');
    });
  });
}

Given(/^the (.+) page is open(?: on ([Ff]irefox|[Cc]hrome))?/, (page, arg) => {
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
    const title = browser.getTitle();
    expect(title).to.equal(`${page} - Nuxeo Dev Tools`);
    injectMocks();
  }
  let tabIds = browser.getTabIds();
  if (tabIds.length === 1) {
    browser.execute(() => {
      window.open('http://localhost:8080/nuxeo');
    });
    browser.pause(500);
    tabIds = browser.getTabIds();
    browser.switchTab(tabIds[1]);
    browser.$('#username').waitForVisible();
    browser.$('#username').addValue('Administrator');
    browser.$('#password').addValue('Administrator');
    browser.$('input.login_button').click();
    browser.pause(500);
    browser.switchTab(tabIds[0]);
  }
});

Then(/^I see (.+) as the connected server/, (url) => {
  // Check url on popup
  expect(url).to.be.a('string');
  expect(browser.$('.server-name-url').getText()).to.equal(url);
});

When(/^I (see|click on) the (.+) (link|button|element)/, (action, selector, element) => {
  selector = selector.replace(/\s+/g, '-').toLowerCase();
  if (element === 'button') {
    selector = `${selector}-button`;
  }
  browser.waitForVisible(`#${selector}`);
  browser.pause(500);
  if (action === 'click on') {
    try {
      browser.$(`#${selector}`).click();
    } catch (err) {
      browser.moveToObject('#about');
      browser.pause(500);
      browser.$(`#${selector}`).click();
    }
    if (!(browser.execute(() => chrome.tabs.create.called).value)) {
      expect(browser.execute(() => {
        getCurrentTabUrl(() => {});
        return window.studioExt.server.url;
      }).value).to.be.equal('http://localhost:8080/nuxeo/');
      injectMocks();
    }
  }
});

When(/I hover on the (.+) element/, (element) => {
  const selector = element.replace(/\s+/g, '-').toLowerCase();
  browser.waitForExist(`#${selector}`).should.be.true;
  browser.moveToObject(`#${selector}`);
  if (selector === 'useful-links') {
    browser.waitForVisible('#dropdown-content');
  }
});

Then(/the (.+) page opens/, (title) => {
  const tabIds = browser.getTabIds();
  for (let i = 0; i < tabIds.length; i += 1) {
    browser.switchTab(tabIds[i]);
    if (title === browser.getTitle()) {
      break;
    }
  }
  return browser.getTitle().should.equal(title);
});

Then(/I am taken to the (.+ )?(popup|page)/, (title, page) => {
  if (page === 'popup') {
    if (title) {
      title = `${title}- `;
    } else {
      title = '';
    }
    expect(browser.getTitle()).to.equal(`${title}Nuxeo Dev Tools`);
  } else {
    browser.waitUntil(() => browser.getTitle() === title.trim());
  }
});

Then(/I am connected to API Playground on (.+)/, (server) => {
  browser.waitForVisible('::shadow div.connection a');
  expect(browser.$('::shadow div.connection a').getText()).to.equal(server);
});

When(/I go to the (.+) page/, (page) => {
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
  expect(browser.getTitle()).to.equal(page);
  if (page === 'Nuxeo Dev Tools') {
    expect(browser.execute(() => {
      getCurrentTabUrl(() => {});
      return window.studioExt.server.url;
    }).value).to.be.equal('http://localhost:8080/nuxeo/');
    injectMocks();
  }
  browser.refresh();
});
