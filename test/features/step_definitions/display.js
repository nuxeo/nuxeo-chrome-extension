module.exports = function () {
  this.Given(/^the extension is open(?: as ([Ff]irefox|[Cc]hrome))?/, (arg) => {
    // Object.keys(global).forEach(k => console.log(k));
    const dist = arg || 'sinon-chrome';

    // Open Popup in the current Window
    const url = `file://${__dirname}/../../../dist/${dist.toLowerCase()}/popup.html`
    browser.url(url);

    // http://chaijs.com/api/bdd/
    expect(browser.getTitle()).to.equal('Nuxeo Dev Tools');
  });

  this.Given('Injected mocks', (javascript) => {
    browser.execute(javascript);
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

  this.Then('I can see $url as the connected server', (url) => {
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

  this.When(/^I click on the( internal)? (.+) link/, (internal, link) => {
    link = link.toLowerCase();

    browser.waitForVisible(`#${link}`);
    browser.$(`#${link}`).click();

    if (internal) {
      // Page changed, need to refresh background context
      expect(browser.execute(() => {
        getCurrentTabUrl(function() {});
        return window.studioExt.server.url;
      }).value).to.be.equal('http://localhost:8080/nuxeo/');
    } else {
      // Otherwise, check that tabs.create has been called
      expect(browser.execute(() => {
        return chrome.tabs.create.called;
      }).value).to.be.true;
    }
  });

  this.Then('current url is $url with title $title', (url, title) => {
    const tabIds = browser.getTabIds();
    expect(tabIds).to.have.lengthOf(2);

    browser.switchTab(tabIds[1]);
    expect(browser.getUrl()).to.be.eq(url);
    expect(browser.getTitle()).to.be.eq(title);
    browser.close();
  });

  this.Then('I am taken to the $popup popup', (popup) => {
    expect(browser.getTitle()).to.equal(`${popup} - Nuxeo Dev Tools`);
  });

  this.Then('I can see the version number', () => {
    browser.waitForVisible('#version');
    expect(browser.$('#version').getText().length).to.be.at.least(5);
  });

  this.Then('the copyright is up-to-date', () => {
    const date = new Date().getFullYear();
    browser.waitForVisible('#copyright');
    expect(browser.$('#copyright').getText()).to.include(date);
  });

}
