module.exports = function () {
  this.Given(/^the extension open(?: as ([Ff]irefox|[Cc]hrome))?/, (build = 'chrome') => {
    // Object.keys(global).forEach(k => console.log(k));

    // Open Popup in the current Window
    const url = `file:///${__dirname}/../../../dist/${build.toLowerCase()}/popup.html`
    browser.url(url);

    // http://chaijs.com/api/bdd/
    expect(browser.getTitle()).to.be.equals('Nuxeo Dev Tools');

    console.log(browser.getUrlAndTitle());
  });

  this.Then('I can see $url as connected server', (url) => {
    // Check url on popup
    expect(url).to.be.a('string');
  });
}
