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
const chai = require('chai');
const login = require('./support/fixtures/auth.js').login;
const modifyDashboard = require('./support/client.js').modifyDashboard;
const AfterAll = require('./support/hooks.js').AfterAll;

const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

Then(/^I am taken to my Studio project/, () => {
  const tabIds = browser.getTabIds();
  browser.switchTab(tabIds[2]);
  try {
    expect(browser.getUrl()).to.have.string('https://connect.nuxeo.com/nuxeo/site/studio/ide?project=bde-test');
  } catch (err) {
    expect(browser.getUrl()).to.have.string('bde-test', 'https://sso.nuxeo.com/cas/login?service');
  }
});

Then(/^I navigate to (.+) from the (.+) heading in Designer/, (page, heading) => {
  const url = `https://connect.nuxeo.com/nuxeo/designer/#/bde-test/ui/${page.toLowerCase()}`;
  browser.url(url);
  browser.pause(1000);
  const title = browser.getTitle();
  expect(title.should.be.equal(`${page} - ${heading}`));
});

When(/^I (see|click on) the Designer customize button/, (action) => {
  try {
    browser.waitForShadowDomElement(['body nuxeo-view-designer', '#dashboard', '#featureEditor div.editor.layout.horizontal div paper-button']);
    if (action === 'click on') {
      browser.shadowDomElement(['body nuxeo-view-designer', '#dashboard', '#featureEditor div.editor.layout.horizontal div paper-button']).click();
    }
  } catch {
    // Customize button is only available once
  }
});

When(/^I (see|click on) the Designer save button/, (action) => {
  browser.waitForShadowDomElement(['body nuxeo-view-designer', '#dashboard', '#featureEditor > div:nth-child(1) > nuxeo-editor-save-button', '#saveButton']);
  if (action === 'click on') {
    browser.shadowDomElement(['body nuxeo-view-designer', '#dashboard', '#featureEditor > div:nth-child(1) > nuxeo-editor-save-button', '#saveButton']).click();
  }
});

When(/^I modify the Dashboard/, () => modifyDashboard(connectUsr, connectPsw));
