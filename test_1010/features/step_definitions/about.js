const { Given, Then, When } = require('cucumber');
const expect = require('chai').expect;

Then(/I see the version number/, () => {
  browser.waitForVisible('#version');
  expect(browser.$('#version').getText().length).to.be.at.least(5);
});

Then(/the copyright is up-to-date/, () => {
  const date = new Date().getFullYear();
  browser.waitForVisible('#copyright');
  expect(browser.$('#copyright').getText()).to.include(date);
});
