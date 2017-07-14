const webpage = require('webpage');
const path = 'dist/chrome';

const evaluateValue = (page, js) => {
  return page.evaluateJavaScript(`function() { return ${js}; }`);
}

const testCases = (popup) => {
  const res = popup.evaluate(() => {
    var url = 'place_holder';
    window.getCurrentTabUrl(function (p) {
      url = p;
    });
    return url;
  });

  console.assert(res);
  console.log(evaluateValue(popup, 'window.studioExt.server.tabId'));
  console.log(evaluateValue(popup, 'window.studioExt.server.url'));

  phantom.exit();
}

asPopup('popup.html', () => {
  // Add stubb for chrome.*
  chrome.tabs.query.yields([{
    url: 'http://localhost:8080/nuxeo/view_documents.faces?conversationId=0NXMAIN',
    id: 1
  }]);
}, testCases);

function asPopup(file, stubs, cb) {
  const popup = webpage.create();

  popup.onError = (msg) => {
    console.log(`ERROR: ${msg}`);
  };

  popup.onConsoleMessage = (msg, lineNum, sourceId) => {
    console.log(`CONSOLE: ${msg} (${sourceId}:${lineNum})`);
  };

  popup.onInitialized = () => {
    const inject = (file) => {
      console.assert(popup.injectJs(file), `Unable to inject ${file}`);
    }

    // Inject sinon-chrome in every request
    inject('node_modules/sinon-chrome/bundle/sinon-chrome.min.js');
    inject(`${path}/scripts/background.js`);

    // Execute stubbing in popup context
    popup.evaluate(stubs || (() => {}));
  };

  popup.open(`${path}/${file}`, (status) => {
    console.assert(status === 'success');
    cb(popup);
  });
}
