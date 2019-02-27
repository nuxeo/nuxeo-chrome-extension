/*
Copyright 2016-2019 Nuxeo

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const { Given, Then, When } = require('cucumber');
const chrome = require('sinon-chrome');
const chai = require('chai');
const create = require('./support/fixtures/documents.js').create;
const init = require('./support/fixtures/documents.js').init;
const inject = require('./support/fixtures/mocks.js').inject;
const login = require('./support/fixtures/auth.js').login;
const findTabByTitle = require('./support/fixtures/nav.js').findTabByTitle;
const openNuxeo = require('./support/fixtures/nav.js').openNuxeo;

const nxPath = 'http://localhost:8080/nuxeo';
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

Given(/^the (.+) page is open/, (page) => {
  if (page.indexOf('extension') > -1) {
    const currentUrl = browser.getUrl();
    page = page.replace(' extension', '');
    // Extension pages
    if (currentUrl.indexOf(`${page.toLowerCase()}.html`) === -1) {
      const url = `file://${__dirname}/../../../dist/sinon-chrome/${page.toLowerCase()}.html`;
      let tabIds = browser.getTabIds();
      if (tabIds.length > 0 && browser.getTitle() !== '') {
        browser.execute((url) => { // eslint-disable-line no-shadow
          window.open(url);
        });
        tabIds = browser.getTabIds();
        findTabByTitle('', tabIds);
        browser.url(url);
      } else {
        browser.url(url);
      }
    }
    expect(browser.getTitle()).to.be.oneOf(['Nuxeo Dev Tools', `${page} - Nuxeo Dev Tools`]);
    expect(browser.execute(() => {
      getCurrentTabUrl(() => {});
      return window.studioExt.server.url;
    }).value).to.be.equal('http://localhost:8080/nuxeo/');
    inject();
    let tabIds = browser.getTabIds();
    if (tabIds.length === 1) {
      openNuxeo();
      browser.pause(500);
      // Switch to Nuxeo
      tabIds = browser.getTabIds();
      findTabByTitle('Nuxeo Platform', tabIds);
      // Log in to Nuxeo
      login('Administrator', 'Administrator', 'input.login_button');
      browser.pause(500);
      // Switch back to extension page
      findTabByTitle('Nuxeo Dev Tools', tabIds);
    }
  } else if (page === 'Studio') {
    let tabIds = browser.getTabIds();
    if (tabIds.length > 1) {
      browser.execute(() => {
        const url = 'https://connect.nuxeo.com/nuxeo/site/studio/ide?project=bde-test';
        window.open(url);
      });
      browser.pause(500);
      tabIds = browser.getTabIds();
      findTabByTitle('Welcome - Nuxeo • Connect – Customer Portal', tabIds);
    } else {
      const url = 'https://connect.nuxeo.com/nuxeo/site/studio/ide?project=bde-test';
      browser.url(url);
    }
    expect(browser.getTitle()).to.equal('Welcome - Nuxeo • Connect – Customer Portal');
  } else if (page === 'Nuxeo') {
    openNuxeo();
    const tabIds = browser.getTabIds();
    findTabByTitle('Nuxeo Dev Tools', tabIds);
  } else {
    assert.fail([`"${page} page" unknown. See "navigation" step definition.`]);
  }
});

Then(/^I log into (.+)/, (page) => {
  if (page === 'Studio') {
    login(connectUsr, connectPsw, 'input.btn-submit');
    // Wait for stuff to happen in Studio so that HTTP calls pass
    browser.pause(8000);
    const title = browser.getTitle();
    expect(title.should.be.equal('Nuxeo Studio'));
  } else if (page === 'Nuxeo') {
    login('Administrator', 'Administrator', 'input.login_button');
  }
});

Then(/the (.+) page opens/, (titleToFind) => {
  const tabIds = browser.getTabIds();
  findTabByTitle(titleToFind, tabIds);
  return browser.getTitle().should.equal(titleToFind);
});

When(/I go to the (.+) page/, (page) => {
  const tabIds = browser.getTabIds();
  if (page === 'Popup extension') {
    page = 'Nuxeo Dev Tools';
  }
  findTabByTitle(page, tabIds);
  browser.refresh();
  expect(browser.getTitle()).to.equal(page);
});

When(/I have a (.+) document in Nuxeo/, (docType) => {
  docType = docType || 'File';
  const doc = init(docType);
  return create('/default-domain/', doc).then((d) => {
    this.doc = d;
  });
});

When(/^I navigate to the document/, () => {
  browser.url(`${nxPath}/ui/#!/browse${this.doc.path}`);
});
