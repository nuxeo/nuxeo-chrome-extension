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
const inject = require('./support/fixtures/mocks.js').inject;
const login = require('./support/fixtures/auth.js').login;

const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

Then(/^I see (.+) as the connected server/, (url) => {
  // Check url on popup
  expect(url).to.be.a('string');
  expect(browser.$('.server-name-url').getText()).to.equal(url);
});

When(/^I (see|click on) the extension (.+) (link|button|element)/, (action, selector, element) => {
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
      inject();
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

Then(/^I refresh the page/, () => {
  browser.refresh();
});

Then(/I am connected to API Playground on (.+)/, (server) => {
  browser.waitForVisible('::shadow div.connection a');
  expect(browser.$('::shadow div.connection a').getText()).to.equal(server);
});
