module.exports = function () {
  const nxPath = 'http://localhost:8080/nuxeo';

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
    browser.url(`${nxPath}/ui/#!/browse${this.doc.path}`);
  });

  this.When(/^I try to create a document/, () => {
    browser.waitForShadowDomElement(['html body nuxeo-app', 'nuxeo-document-create-button', '#tray #createBtn'], 5000);
    browser.shadowDomElement(['html body nuxeo-app', 'nuxeo-document-create-button', '#tray #createBtn']).click();
  });

  this.Then(/^I (can't )?see the (.+) document type/, (notVisible, docType) => {
    browser.waitForShadowDomElement(['html body nuxeo-app', 'nuxeo-document-create-popup', '#createDocDialog']);
    if (notVisible) {
      if (browser.shadowDomElement(['html body nuxeo-app',
        'nuxeo-document-create-popup', '#createDocDialog #holder iron-pages #simpleCreation',
        `iron-pages .vertical .container paper-dialog-scrollable paper-button[name="${docType}"]`]).value === null) {
        return true;
      } else {
        return false;
      }
    } else if (browser.shadowDomElement(['html body nuxeo-app',
      'nuxeo-document-create-popup', '#createDocDialog #holder iron-pages #simpleCreation',
      `iron-pages .vertical .container paper-dialog-scrollable paper-button[name="${docType}"]`]).value !== null) {
      return true;
    } else {
      return false;
    }
  });

  this.Then(/^the Nuxeo page refreshes/, () => {
    browser.waitUntil(() => browser.execute(() => chrome.tabs.reload.called).value, 20000);
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
