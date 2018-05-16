/*
Copyright 2016-2018 Nuxeo

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

let persistedVars = {};
persistedVars.dependencyMismatch = false;

function persistVar(key, value){
  persistedVars[key] = value;
}

window.bkgHotReload = (startLoading, stopLoading, validate, showDependencyError) => {
  let nuxeo;
  getCurrentTabUrl((url) => {
    nuxeo = newNuxeo({
      baseURL: url,
    });
    startLoading();
    nuxeo.operation('Service.HotReloadStudioSnapshot')
      .params({
        validate,
      })
      .execute()
      .then((res) => {
        try {
          stopLoading();
        }
        catch(e) {
          // Popup is closed
        }
        if (res.length > 0 && res[0].status && res[0].status === 'success') {
          notification((res[0].status), 'Success!', res[0].message, '../images/nuxeo-128.png', false);
          chrome.tabs.reload(window.studioExt.server.tabId);
        } else if (res.status && res.status === 204) {
          notification('success', 'Success!', 'A Hot Reload has successfully been completed.', '../images/nuxeo-128.png', false);
          chrome.tabs.reload(window.studioExt.server.tabId);
        // Error handling for Nuxeo 9.3 and later
        } else if (res.length > 0 && res[0].status && res[0].status === 'error') {
          notification(res[0].status, 'Error', res[0].message, '../images/access_denied.png', false);
        } else if (res.length > 0 && res[0].status && res[0].status === 'updateInProgress') {
          notification(res[0].status, 'Error', res[0].message, '../images/access_denied.png', false);
        } else if (res.length > 0 && res[0].status && res[0].status === 'dependencyMismatch') {
          notification(res[0].status, 'Dependency Mismatch', res[0].message, '../images/access_denied.png', false);
          persistedVars.uninstalledDeps = res[0].deps;
          try {
            showDependencyError(persistedVars.uninstalledDeps);
          }
          catch(e) {
            // Popup is closed
          }
          persistedVars.dependencyMismatch = true;
        }
      })
      .catch((e) => {
        // Error handling for Nuxeo 9.2 and older
        window.executeScript(checkDependencies, null, (text) => {
          const checkDeps = JSON.parse(text).match;
          let message = '';
          let dependencyError = {};
          if (JSON.parse(text).nx !== JSON.parse(text).studioDistrib[0]) {
            message += `${JSON.parse(text).studio} - ${JSON.parse(text).studioDistrib[0]} cannot be installed on Nuxeo ${JSON.parse(text).nx}.`;
            dependencyError = {
              id: 'dependencyMismatch',
              title: 'Dependency Mismatch',
              message,
              imageUrl: '../images/access_denied.png',
              interaction: true,
            };
          } else {
            dependencyError = defaultServerError;
          }
          if (!checkDeps) {
            stopLoading();
            handleErrors(e, dependencyError);
            const deps = JSON.parse(text).deps;
            if (deps.length > 0) {
              const items = [];
              deps.forEach((dep) => {
                items.push({ title: '', message: dep.name });
              });
              chrome.notifications.create('dependency_check', {
                type: 'list',
                title: 'Check Dependencies',
                message: 'Please check that the following dependencies are installed:',
                items,
                iconUrl: '../images/access_denied.png',
                requireInteraction: true,
              }, () => {
                console.log(chrome.runtime.lastError);
              });
            }
          } else {
            startLoading();
            nuxeo.operation('Service.HotReloadStudioSnapshot').execute()
              .then(() => {
                notification('success', 'Success!', 'A Hot Reload has successfully been completed.', '../images/nuxeo-128.png', false);
                chrome.tabs.reload(window.studioExt.server.tabId);
              })
              .catch((er) => {
                handleErrors(er, defaultServerError);
              });
            stopLoading();
          }
        });
      });
  });
};
