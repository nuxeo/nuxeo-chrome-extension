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

const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
const nxPath = 'http://localhost:8080/nuxeo';

Then(/^I am taken to my Studio project/, () => {
  const tabIds = browser.getTabIds();
  browser.switchTab(tabIds[2]);
  try {
    expect(browser.getUrl()).to.have.string('https://connect.nuxeo.com/nuxeo/site/studio/ide?project=bde-test');
  } catch (err) {
    expect(browser.getUrl()).to.have.string('bde-test', 'https://sso.nuxeo.com/cas/login?service');
  }
});

When(/I have a (.+) document in Nuxeo/, (docType) => {
  docType = docType || 'File';
  const doc = fixtures.documents.init(docType);
  return fixtures.documents.create('/default-domain/', doc).then((d) => {
    this.doc = d;
  });
});

When(/^I navigate to the document/, () => {
  browser.url(`${nxPath}/ui/#!/browse${this.doc.path}`);
});

When(/^I try to create a document/, () => {
  browser.waitForShadowDomElement(['html body nuxeo-app', 'nuxeo-document-create-button', '#tray #createBtn'], 5000);
  browser.shadowDomElement(['html body nuxeo-app', 'nuxeo-document-create-button', '#tray #createBtn']).click();
});

Then(/^I (can't )?see the (.+) document type/, (notVisible, docType) => {
  browser.waitForShadowDomElement(['html body nuxeo-app', 'nuxeo-document-create-popup', '#createDocDialog']);
  const customDocType = browser.shadowDomElement(['html body nuxeo-app',
    'nuxeo-document-create-popup', '#createDocDialog #holder iron-pages #simpleCreation',
    `iron-pages .vertical .container paper-dialog-scrollable paper-button[name="${docType}"]`]).value;
  if (notVisible) {
    const tabIds = browser.getTabIds();
    browser.switchTab(tabIds[0]);
    return expect(customDocType).to.equal(null);
  } else {
    const tabIds = browser.getTabIds();
    browser.switchTab(tabIds[0]);
    return expect(customDocType).to.exist;
  }
});

Then(/^the Nuxeo page refreshes/, () => {
  browser.waitUntil(() => browser.execute(() => chrome.tabs.reload.called).value, 20000);
  const tabIds = browser.getTabIds();
  for (let i = 0; i < tabIds.length; i += 1) {
    if (browser.getTitle().indexOf('Nuxeo Platform') === -1) {
      browser.switchTab(tabIds[i]);
    } else {
      return browser.refresh();
    }
  }
  return browser.refresh();
});
