module.exports = function () {

  function injectMocks() {
    return browser.execute(() => {
      chrome.tabs.create.callsFake((opts) => {
        //window.document.location = opts.url;
        window.open(opts.url);
      });
    });
  }

  this.Given(/^the (.+) page is open(?: on ([Ff]irefox|[Cc]hrome))?/, (page, arg) => {
    // Object.keys(global).forEach(k => console.log(k));
    const dist = arg || 'sinon-chrome';

    // Open Popup in the current Window
    const url = `file://${__dirname}/../../../dist/${dist.toLowerCase()}/${page.toLowerCase()}.html`
    browser.url(url);

    // http://chaijs.com/api/bdd/
    if (page === 'Popup') {
      expect(browser.getTitle()).to.equal('Nuxeo Dev Tools');
    } else {
      expect(browser.execute(() => {
        getCurrentTabUrl(function() {});
        return window.studioExt.server.url;
      }).value).to.be.equal('http://localhost:8080/nuxeo/');
      expect(browser.getTitle()).to.equal(`${page} - Nuxeo Dev Tools`);
      injectMocks();
    }
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
      injectMocks();
    } else {
      // Otherwise, check that tabs.create has been called
      expect(browser.execute(() => {
        return chrome.tabs.create.called;
      }).value).to.be.true;
    }
  });

  this.Then('the $title page opens', (title) => {
    const tabIds = browser.getTabIds();
    expect(tabIds).to.have.lengthOf(2);
    browser.switchTab(tabIds[1]);
    expect(browser.getTitle()).to.be.eq(title);
    browser.close();
  });

  this.Then(/I am taken to the (.+ )?popup/, (popup) => {
    let title = '';
    if (popup) {
      title = `${popup}- `;
    }
    expect(browser.getTitle()).to.equal(`${title}Nuxeo Dev Tools`);
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
