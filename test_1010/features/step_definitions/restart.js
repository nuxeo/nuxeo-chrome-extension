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
const Nuxeo = require('nuxeo');
const expect = require('chai').expect;

const nuxeo = new Nuxeo({
  baseURL: 'http://localhost:8080/nuxeo/',
  auth: {
    method: 'basic',
    username: 'Administrator',
    password: 'Administrator',
  },
});

Then(/I see the confirmation dialog/, () => {
  browser.waitForVisible('div.confirmation-modal');
});

When(/I confirm the dialog/, () => {
  browser.$('button.confirm').click();
});

Then(/the server restarts/, { timeout: 120000 }, () => {
  let connected = true;
  while (connected) {
    browser.pause(5000);
    nuxeo.connect()
      .then(async (client) => {
        connected = await nuxeo.connected;
      })
      .catch(() => {
        connected = false;
      });
  }
  while (!connected) {
    browser.pause(5000);
    nuxeo.connect()
      .then(async (client) => {
        connected = await nuxeo.connected;
      })
      .catch(() => {
        connected = false;
      });
  }
});

Then(/I can log back into Nuxeo/, () => {
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
