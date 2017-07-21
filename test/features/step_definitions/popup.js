module.exports = function () {
  this.Given(/^the extension open(?: as ([Ff]irefox|[Cc]hrome))?/, (arg) => {
    // Object.keys(global).forEach(k => console.log(k));
    const dist = arg || 'sinon-chrome';

    // Open Popup in the current Window
    const url = `file:///${__dirname}/../../../dist/${dist.toLowerCase()}/popup.html`
    browser.url(url);

    // http://chaijs.com/api/bdd/
    expect(browser.getTitle()).to.be.equals('Nuxeo Dev Tools');
  });

  this.When('I enter $text in search input', (text) => {
    browser.$('#json-search').addValue(text);
    // Wait until debouncing is ok
    browser.waitForVisible('#loading-gif');
    browser.screenshot();
    browser.waitForVisible('#loading-gif', 2000, true);
  });

  this.Then('I wait until $selector is not empty', (selector) => {
    browser.waitForExist(`${selector} > *`);
    browser.screenshot();
  });

  this.Then('I can see $url as connected server', (url) => {
    // Check url on popup
    expect(url).to.be.a('string');
    expect(browser.$('.server-name-url').getText()).to.be.equals(url);
  });

  this.Then(/Server responds with (\d+) documents?/, (size) => {
    expect(browser.$('#json-search-results').$$('.search-result').length).to.be.equals(Number.parseInt(size));
  });

  this.Then(/Document (\d+) title is (.+) and parent path (.+)/, (index, title, parentPath) => {
    const trs = browser.$$('#json-search-results tbody tr');
    const trTitle = trs[index - 1];
    const trPath = trs[index];

    expect(trTitle.$('.doc-title').getText()).to.be.equals(title);
    expect(trPath.$('.doc-path').getText()).to.be.equals(parentPath);
  });
}
