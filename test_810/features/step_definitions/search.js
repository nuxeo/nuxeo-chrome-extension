module.exports = function () {
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
};
