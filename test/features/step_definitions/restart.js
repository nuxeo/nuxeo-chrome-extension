const { Given, Then, When } = require('cucumber');
const expect = require('chai').expect;
const Nuxeo = require('nuxeo');

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
