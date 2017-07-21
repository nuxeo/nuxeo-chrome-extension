/*
Copyright 2016 Nuxeo

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const nxPattern = /(^https?:\/\/[A-Za-z_\.0-9:-]+\/[A-Za-z_\.0-9-]+\/)(?:(?:nxdoc|nxpath|nxsearch|nxadmin|nxhome|nxdam|nxdamid|site\/[A-Za-z_\.0-9-]+)\/[A-Za-z_\.0-9-]+|view_documents\.faces|ui\/#!\/\w+\/?|view_domains\.faces|view_home\.faces)/;

var window = window || {};
window.app = window.app || {};
var studioExt = window.studioExt = window.studioExt || {};

const notification = window.notification = (idP, titleP, messageP, img) => {
  chrome.notifications.create(idP, {
    type: 'basic',
    title: titleP,
    message: messageP,
    iconUrl: img
  }, function() {
    console.log(chrome.runtime.lastError);
  });
};

/**
 * XXX Temp solution in order to be able to force Auth
 */
const newNuxeo = window.newNuxeo = (opts) => {
  const _opts = opts || {};
  if (window.app.auth) {
    _opts.auth = window.app.auth;
  }

  return new Nuxeo(_opts);
}

const getCurrentTabUrl = window.getCurrentTabUrl = (callback) => {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    const [tab] = tabs;
    const matchGroups = nxPattern.exec(tab.url);
    if (!matchGroups) {
      callback(null)
      return;
    }

    const [,url] = matchGroups;
    window.studioExt.server = {
      url,
      tabId: tab.id
    }

    callback(url);
  });
};

window.bkgHotReload = function(startLoading, stopLoading) {
  var nuxeo;
  getCurrentTabUrl(function(url) {
    nuxeo = newNuxeo({
      baseURL: url
    });
    startLoading();
    nuxeo.operation('Service.HotReloadStudioSnapshot').execute()
      .then(function() {
        notification('success', 'Success!', 'A Hot Reload has successfully been completed.', '../images/nuxeo-128.png');
        chrome.tabs.reload(window.studioExt.server.tabId);
        stopLoading();
      })
      .catch(function(e) {
        e.response.json().then(function(json) {
          stopLoading();
          var msg = json.message;
          var err = e.response.status;
          if (msg == null) {
            notification('no_hot_reload', 'Hot Reload Operation not found.', 'Your current version of Nuxeo does not support the Hot Reload function.', '../images/access_denied.png');
          } else if (err >= 500) {
            notification('access_denied', 'Access denied!', 'You must have Administrator rights to perform this function.', '../images/access_denied.png');
          } else if (err >= 300 && err < 500) {
            notification('bad_login', 'Bad Login', 'Your Login and/or Password are incorrect', '../images/access_denied.png');
          } else {
            notification('unknown_error', 'Unknown Error', 'An unknown error has occurred. Please try again later.', '../images/access_denied.png');
          }
        })
      });
  });
};

window.restart = function(startLoadingRS, stopLoading) {
    var nuxeo;
    getCurrentTabUrl(function(url) {
      nuxeo = newNuxeo({
        baseURL: url
      });
      startLoadingRS();
      nuxeo._http({
          method: 'POST',
          schemas: [],
          enrichers: [],
          fetchProperties: [],
          url: nuxeo._baseURL.concat('site/connectClient/uninstall/restart'),
        })
        .then(function() {
          notification('error', 'Something went wrong...', 'Please try again later.', '../images/access_denied.png');
          stopLoading();
        })
        .catch(function(e) {
          notification('success', 'Success!', 'Nuxeo server is restarting...', '../images/nuxeo-128.png');
          stopLoading();
          setTimeout(function() {
            chrome.tabs.reload(studioExt.server.tabId);;
          }, 4000);
        });
    });
}

window.reindex = function() {
  var nuxeo;
  getCurrentTabUrl(function(url) {
    nuxeo = newNuxeo({
      baseURL: url
    });
    nuxeo.operation('Elasticsearch.Index').execute()
      .then(function() {
        notification('success', 'Success!', 'Your repository index is rebuilding.', '../images/nuxeo-128.png');
      })
      .catch(function(e) {
        notification('error', 'Something went wrong...', 'Please try again later.', '../images/access_denied.png');
      })

  })
}

window.reindexNXQL = function(input) {
  var nuxeo;
  getCurrentTabUrl(function(url) {
    nuxeo = newNuxeo({
      baseURL: url
    });
    nuxeo.operation('Elasticsearch.Index')
      .params({
        nxql: input
      })
      .execute()
      .then(function() {
        notification('success', 'Success!', 'Your repository index is rebuilding.', '../images/nuxeo-128.png');
      })
      .catch(function(e) {
        notification('error', 'Something went wrong...', 'Please try again later.', '../images/access_denied.png');
      })

  })
}

window.reindexDocId = function(input) {
  var nuxeo;
  getCurrentTabUrl(function(url) {
    nuxeo = newNuxeo({
      baseURL: url
    });
    nuxeo.operation('Elasticsearch.Index')
      .input(input)
      .execute()
      .then(function() {
        notification('success', 'Success!', 'Your repository index is rebuilding.', '../images/nuxeo-128.png');
      })
      .catch(function(e) {
        notification('error', 'Something went wrong...', 'Please try again later.', '../images/access_denied.png');
      })

  })
}

