module.exports = function () {
  const nxPath = 'http://localhost:8080/nuxeo/nxpath/default';

  this.Then(/^I am taken to my Studio project/, () => {
    const tabIds = browser.getTabIds();
    browser.switchTab(tabIds[2]);
    try {
      expect(browser.getUrl()).to.have.string('https://connect.nuxeo.com/nuxeo/site/studio/ide?project=bde-test');
    } catch (err) {
      expect(browser.getUrl()).to.have.string('bde-test', 'https://sso.nuxeo.com/cas/login?service');
    }
  });

  this.When(/^I have a (.+) document in Nuxeo/, (docType) => {
    docType = docType || 'File';
    const doc = fixtures.documents.init(docType);
    return fixtures.documents.create(this.doc.path, doc).then((d) => {
      this.doc = d;
    });
  });

  this.When(/^I navigate to the document/, () => {
    browser.url(`${nxPath}${this.doc.path}@view_documents`);
  });

  this.When(/^I try to create a document/, () => {
    browser.$('//*[@id="nxw_newDocument_form:nxw_newDocument_link"]').waitForVisible();
    browser.$('//*[@id="nxw_newDocument_form:nxw_newDocument_link"]').click();
  });

  this.Then(/^I (can't )?see the (.+) document type/, (notVisible, docType) => {
    browser.$('#nxw_newDocument_after_view_box').waitForVisible();
    if (notVisible) {
      browser.$(`//*[@id="nxw_newDocument_after_view_fancy_subview:nxw_newDocument_after_view_fancyform:${docType}"]`).isVisible().should.be.false;
    } else {
      browser.$(`//*[@id="nxw_newDocument_after_view_fancy_subview:nxw_newDocument_after_view_fancyform:${docType}"]`).isVisible().should.be.true;
    }
  });

  this.Then(/^the Nuxeo page refreshes/, () => {
    browser.waitUntil(() => browser.execute(() => chrome.tabs.reload.called).value, 10000);
    const tabIds = browser.getTabIds();
    for (let i = 0; i < tabIds.length; i += 1) {
      if (browser.getTitle() !== 'Nuxeo Platform - Domain') {
        browser.switchTab(tabIds[i]);
      } else {
        return;
      }
    }
    browser.refresh();
  });
};
