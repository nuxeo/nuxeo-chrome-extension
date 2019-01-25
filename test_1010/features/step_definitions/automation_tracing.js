const { Given, Then, When } = require('cucumber');

function toggleTraces(page) {
  if (page === 'Popup') {
    browser.$('#traces-button').waitForVisible();
    browser.$('#traces-button').click();
  } else {
    browser.$('//a[@href="/nuxeo/site/automation/doc/toggleTraces"]').waitForVisible();
    browser.$('//a[@href="/nuxeo/site/automation/doc/toggleTraces"]').click();
  }
}

function tracesEnabled(page) {
  if (page === 'Popup') {
    browser.pause(500);
    browser.$('#traces-button').waitForVisible();
    const elementClass = browser.$('#traces-button').getAttribute('class');
    const enabled = elementClass.indexOf('enabled') > -1;
    if (enabled === true) {
      return true;
    } else {
      return false;
    }
  } else if (browser.$('a.button').getText() === 'Disable') {
    return true;
  } else if (browser.$('a.button').getText() === 'Enable') {
    return false;
  } else {
    return undefined;
  }
}

Then(/^I can see that traces are (enabled|disabled) on the (Automation Documentation|Popup) page/, (mode, page) => {
  browser.refresh();
  if (mode === 'enabled') {
    tracesEnabled(page).should.be.true;
  } else {
    tracesEnabled(page).should.be.false;
  }
});

Then(/I click on the (.+) operation/, (operation) => {
  const tabIds = browser.getTabIds();
  browser.switchTab(tabIds[2]);
  browser.$(`//a[text()="${operation}"]`).waitForVisible;
  browser.$(`//a[text()="${operation}"]`).click();
});

When(/^traces are (enabled|disabled) from the (Automation Documentation|Popup) page$/, (action, page) => {
  if (tracesEnabled(page) && action === 'disabled') {
    toggleTraces(page);
    tracesEnabled(page).should.be.false;
  } else if (!tracesEnabled(page) && action === 'enabled') {
    toggleTraces(page);
    tracesEnabled(page).should.be.true;
  }
});
