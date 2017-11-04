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

/* global DOMPurify */

(function (window) {
  window.app = window.app || {};
  const app = window.app;

  const checkStudioPkg = `import groovy.json.JsonOutput;
    import org.nuxeo.connect.packages.PackageManager;
    import org.nuxeo.connect.client.we.StudioSnapshotHelper;
    import org.nuxeo.ecm.admin.runtime.RuntimeInstrospection;
    import org.nuxeo.runtime.api.Framework;

    def pm = Framework.getLocalService(PackageManager.class);
    def snapshotPkg = StudioSnapshotHelper.getSnapshot(pm.listRemoteAssociatedStudioPackages());
    def pkgName = snapshotPkg == null ? null : snapshotPkg.getName();
    def bundles = RuntimeInstrospection.getInfo();

    println JsonOutput.toJson([studio: pkgName]);`;

  const checkAddons = `import groovy.json.JsonOutput;
    import org.nuxeo.connect.packages.PackageManager;
    import org.nuxeo.runtime.api.Framework;

    def pm = Framework.getLocalService(PackageManager.class);
    def addons = pm.listInstalledPackagesNames();

    println JsonOutput.toJson([installed: addons]);`;

  app.browser.getBackgroundPage((bkg) => {
    function debounce(fn, delay) {
      let timer = null;
      return function (...args) {
        const context = this;
        clearTimeout(timer);
        timer = setTimeout(() => {
          fn.apply(context, args);
        }, delay);
      };
    }

    let position;

    function startLoadingHR() {
      const a = $('a#hot-reload-button');
      position = a.position();
      $('#loading').css({ display: 'block', top: (position.top - 5), left: (position.left - 50) });
    }

    function startLoadingRS() {
      const a = $('a#restart-button');
      position = a.position();
      $('#loading').css({ display: 'block', top: (position.top - 5), left: (position.left - 50) });
    }

    function stopLoading() {
      $('#loading').css('display', 'none');
    }

    function showDependencyError(deps) {
      let nuxeoctlCommand = 'nuxeoctl mp-install';
      deps.forEach((dep) => {
        const li = document.createElement('li');
        li.textContent = dep;
        $('#deps-list').append(li);
        nuxeoctlCommand += ` ${dep}`;
      });
      $('div.nuxeoctl-command').append(nuxeoctlCommand);
      $('div.shade').show();
      $('div.deps-popup').show();
      const msgHeight = document.getElementsByClassName('deps-popup')[0].offsetHeight;
      const htmlHeight = $('html').height();
      if (msgHeight > 360) {
        const heightDiff = msgHeight - 360;
        $('html').css('height', (htmlHeight + heightDiff));
      } else {
        $('html').css('height', 'auto');
      }
    }

    function hideDependencyError() {
      $('deps-list').empty();
      $('div.nuxeoctl-command').empty();
      $('div.shade').hide();
      $('div.deps-popup').hide();
    }

    function studioPackageFound(packageName) {
      $('#no-studio-buttons').css('display', 'none');
      $('#studio').css('display', 'flex');
      $('#studio-buttons').css('display', 'block');

      if (bkg.designerLivePreview.isEnabled()) {
        $('#designer-livepreview-button').addClass('enabled');
        $('#designer-livepreview-button').removeClass('disabled');
      } else {
        $('#designer-livepreview-button').addClass('disabled');
        $('#designer-livepreview-button').removeClass('enabled');
      }

      const studioUrl = `${bkg.CONNECT_URL}/nuxeo/site/studio/ide?project=${packageName}`;
      $('#designer-livepreview-login').attr('href', studioUrl);
      $('#studio').click(() => {
        let connectUrl = 'https://connect.nuxeo.com/';
        chrome.storage.sync.get('value', (res) => {
          if (res.value && res.value.length > 0) {
            connectUrl = res.value;
          }
          const studioUrl = `${connectUrl}nuxeo/site/studio/ide?project=${pkgName}`;
          app.browser.createTabs(studioUrl, bkg.studioExt.server.tabId);
        });
      });
      $('#hot-reload-button').click(() => {
        bkg.bkgHotReload(startLoadingHR, stopLoading, true, showDependencyError);
      });
      $('#designer-livepreview-button').click(() => {
        if (bkg.designerLivePreview.isEnabled()) {
          bkg.designerLivePreview.disable();
          $('#designer-livepreview-button').removeClass('enabled');
          $('#designer-livepreview-button').addClass('disabled');
        } else {
          bkg.designerLivePreview.enable(packageName, bkg.studioExt.server.url)
            .then(() => {
              $('#designer-livepreview-button').addClass('enabled');
              $('#designer-livepreview-button').removeClass('disabled');
            })
            .catch(() => {
              $('#designer-livepreview-message').css('display', 'block');
              setTimeout(() => {
                $('#designer-livepreview-message').css('display', 'none');
              }, 5000);
            });
        }
      });
      $('#force-hot-reload-button').click(() => {
        bkg.bkgHotReload(startLoadingHR, stopLoading, false, showDependencyError);
        hideDependencyError();
        bkg.persistVar('dependencyMismatch', false);
      });
      $('#cancel-button').click(() => {
        hideDependencyError();
        bkg.persistVar('dependencyMismatch', false);
        $('html').css('height', 'auto');
      });
    }

    function noStudioPackageFound() {
      $('#studio, #studio-buttons').css('display', 'none');
      $('#no-studio-buttons').css('display', 'block');
      $('#message').css('display', 'none');
      $('#nopkg').css('display', 'block');
      $('#studio, #hot-reload-button').click(() => {
        bkg.notification('no_studio_project',
          'No associated Studio project',
          'If you\'d like to use this function, please associate your Nuxeo server with a studio project',
          '../images/access_denied.png');
      });
      setTimeout(() => {
        $('#nopkg');
      }, 5000);
    }

    function registerLink(element, url) {
      $(element).click(() => {
        app.browser.createTabs(url, bkg.studioExt.server.tabId);
      });
    }

    function checkDependencyMismatch() {
      if (bkg.persistedVars.dependencyMismatch && bkg.persistedVars.uninstalledDeps.length > 0) {
        showDependencyError(bkg.persistedVars.uninstalledDeps);
      } else {
        hideDependencyError();
      }
    }

    $(document).ready(() => {
      $('#searchclear').click(() => {
        $('#search').val('');
        $('.no-result').css('display', 'none');
        $('#search-results').empty();
        $('body').css('overflow-y', 'hidden');
        $('html').outerHeight(height + 66);
      });

      $('#nxql-clear').click(() => {
        $('#nxql-docid').val('');
      });

      $('#logo').click(() => {
        $('#connect-url').toggle();
      });

      chrome.storage.sync.get('value', (res) => {
        if (res.value && res.value.length > 0) {
          $('#logo').css('background-image', 'url("../images/nuxeo-contrast.png")');
          $('#connect-url-input').val(res.value);
        } else {
          $('#logo').css('background-image', 'url("../images/nuxeo_block-30.png")');
        }
      });

      chrome.storage.sync.get('highlight', (res) => {
        if (res.highlight !== undefined) {
          if (res.highlight) {
            $('#highlight-input').prop('checked', true);
          } else {
            $('#highlight-input').prop('checked', false);
          }
        } else {
          chrome.storage.sync.set({ highlight: true }, () => {
            $('#highlight-input').prop('checked', true);
          });
        }
      });

      $('#save').click(() => {
        const input = $('#connect-url-input').val();
        const highlight = $('#highlight-input').prop('checked');
        if (input.length > 0) {
          chrome.storage.sync.set({ value: input }, () => {
            $('#logo').css('background-image', 'url("../images/nuxeo-contrast.png")');
            $('#save').hide();
            $('#reset').show();
            $('#connect-url').hide();
          });
        }
        chrome.storage.sync.set({ highlight }, () => {
          alert('Your changes have been saved.'); // eslint-disable-line no-alert
        });
      });

      $('#reset').click(() => {
        $.confirm({
          title: 'Reset Options',
          text: 'Click Reset to reset all options to default settings.',
          confirmButton: 'Reset',
          cancelButton: 'Cancel',
          confirm: () => {
            chrome.storage.sync.clear(() => {
              $('#logo').css('background-image', 'url("../images/nuxeo_block-30.png")');
              $('#save').show();
              $('#reset').hide();
              $('#connect-url-input').val('');
              $('#connect-url').hide();
              $('#highlight-input').prop('checked', true);
            });
          },
        });
      });

      checkDependencyMismatch();

      let onUI;
      let nuxeo;

      function getJsonFromPath(input) {
        input = decodeURIComponent(input);
        chrome.storage.sync.get('highlight', (res) => {
          if (res.highlight) {
            nuxeo.request(`/path${input}`)
              .schemas('*')
              .enrichers({ document: ['acls', 'permissions'] })
              .get({ resolveWithFullResponse: true })
              .then(result => result.json())
              .then(openJsonWindow)
              .catch((error) => {
                throw new Error(error);
              });
          } else {
            const jsonUrl = `${nuxeo._baseURL}api/v1/path${input}?enrichers.document=acls,permissions`;
            app.browser.createTabs(jsonUrl, bkg.studioExt.server.tabId);
          }
        });
      }

      function getJsonFromGuid(input) {
        chrome.storage.sync.get('highlight', (res) => {
          if (res.highlight) {
            nuxeo.request(`/id/${input}`)
              .schemas('*')
              .enrichers({ document: ['acls', 'permissions'] })
              .get({ resolveWithFullResponse: true })
              .then(result => result.json())
              .then(openJsonWindow)
              .catch((error) => {
                throw new Error(error);
              });
          } else {
            const jsonUrl = `${nuxeo._baseURL}api/v1/id${input}?enrichers.document=acls,permissions`;
            app.browser.createTabs(jsonUrl, bkg.studioExt.server.tabId);
          }
        });
      }

      bkg.getCurrentTabUrl((url) => {
        nuxeo = bkg.newNuxeo({
          baseURL: url,
        });
        nuxeo.login()
          .then((res) => {
            if (!res.user.isAdministrator) {
              $('.buttons').css('display', 'none');
              $('.toggles').css('display', 'none');
            }
          }).catch((e) => {
            console.log(e);
          });
        bkg.executeScript(checkStudioPkg, noStudioPackageFound, (text) => {
          const pkgName = JSON.parse(text).studio;
          if (pkgName) {
            studioPackageFound(pkgName);
          } else {
            noStudioPackageFound();
          }
        });

        nuxeo.operation('Traces.ToggleRecording')
          .params({ readOnly: true })
          .execute()
          .then((response) => {
            if (response.value) {
              $('#traces-button').addClass('enabled');
              $('#traces-button').removeClass('disabled');
            } else {
              $('#traces-button').addClass('disabled');
              $('#traces-button').removeClass('enabled');
            }
          });

        nuxeo.connect()
          .then((client) => {
            $('#platform-version').text(` ${client.serverVersion}`);
            if (!client.serverVersion.gt(client.SERVER_VERSIONS.LTS_2019)) {
              chrome.storage.sync.set({ highlight: true }, () => {
                $('.highlight-option').hide();
              });
            }
          });

        const serverString = DOMPurify.sanitize(nuxeo._baseURL);
        $('div.server-name-url').text(serverString);

        const serverURL = nuxeo._baseURL.replace(/\/$/, '');

        bkg.executeScript(checkAddons, null, (text) => {
          let playgroundUrl = '';
          if (JSON.parse(text).installed.includes('nuxeo-api-playground')) {
            playgroundUrl = nuxeo._baseURL.concat('playground/#/').concat(serverURL);
          } else {
            playgroundUrl = ('http://nuxeo.github.io/api-playground/#/').concat(serverURL);
          }
          return registerLink('#api-playground', playgroundUrl);
        });

        registerLink('#automation-doc', nuxeo._baseURL.concat('site/automation/doc/'));
        registerLink('#explorer', 'https://explorer.nuxeo.com');
        registerLink('#nxql', 'https://doc.nuxeo.com/nxdoc/nxql/');
        registerLink('#el-scripting', 'https://doc.nuxeo.com/nxdoc/understand-expression-and-scripting-languages-used-in-nuxeo/');
        registerLink('#mvel', 'https://doc.nuxeo.com/nxdoc/use-of-mvel-in-automation-chains/');
        registerLink('#workflow-variables', 'https://doc.nuxeo.com/nxdoc/variables-available-in-the-automation-context/');
        registerLink('#escalation-rules', 'https://doc.nuxeo.com/nxdoc/escalation-service/');
        registerLink('#nuxeo-elements', 'https://www.webcomponents.org/author/nuxeo');
        registerLink('#nuxeo-layouts', 'http://showcase.nuxeo.com/nuxeo/layoutDemo/');
        registerLink('#style-guide', 'http://showcase.nuxeo.com/nuxeo/styleGuide/');

        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const pathPattern = /^\//;
        const docPattern = /nxpath\/[A-Za-z_\.0-9-]+(\/[A-Za-z\.0-9_\- \/%~:?#'"]+)|(?:nxdoc[\/A-Za-z_\.0-9]+)([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/;
        const uiDocPattern = /nuxeo\/ui\/#!\/browse(\/.+?(?=\?|$))|(?:nuxeo\/ui\/#!\/doc[\/A-Za-z_\.0-9]+)([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/;
        const matchGroupDoc = docPattern.exec(bkg.tabUrl);
        const matchGroupUiDoc = uiDocPattern.exec(bkg.tabUrl);

        function exportCurrentLink(docPath) {
          $('#export-current').css('display', 'block');
          $('#export-current').click(() => {
            if (uuidPattern.test(docPath)) {
              getJsonFromGuid(docPath);
            } else if (pathPattern.test(docPath)) {
              getJsonFromPath(docPath);
            }
          });
        }

        if (matchGroupDoc) {
          onUI = false;
          if (matchGroupDoc[1]) {
            exportCurrentLink(matchGroupDoc[1]);
          } else if (matchGroupDoc[2]) {
            exportCurrentLink(matchGroupDoc[2]);
          }
        } else if (matchGroupUiDoc) {
          onUI = true;
          if (matchGroupUiDoc[1]) {
            exportCurrentLink(matchGroupUiDoc[1]);
          } else if (matchGroupUiDoc[2]) {
            exportCurrentLink(matchGroupUiDoc[2]);
          }
        }
      });

      let height = $('html').height();

      function showSearchResults(icon, title, path, uid, vMajor, vMinor) {
        const iconLink = nuxeo._baseURL.concat(icon);
        const iconTag = document.createElement('td');
        const image = document.createElement('img');
        const titleTag = document.createElement('td');
        const jsonTag = document.createElement('td');
        const jsonIcon = $('.json-icon-large').clone();
        const pathTag = document.createElement('td');
        const searchResult = document.createElement('tr');
        const searchResultPath = document.createElement('tr');
        iconTag.setAttribute('colspan', '1');
        iconTag.className = 'icon';
        image.className = 'doc-icon';
        image.setAttribute('src', `${iconLink}`);
        image.setAttribute('alt', 'icon');
        iconTag.appendChild(image);
        titleTag.setAttribute('colspan', '18');
        titleTag.setAttribute('title', 'Open document in another tab');
        titleTag.className = 'doc-title';
        titleTag.id = `${uid}`;
        if ((typeof vMajor !== 'undefined' && typeof vMinor !== 'undefined') && (vMajor !== 0 || vMinor !== 0)) {
          titleTag.textContent = `${title} `;
          const span = document.createElement('span');
          span.className = 'version';
          span.textContent = `v${vMajor}.${vMinor}`;
          titleTag.appendChild(span);
        } else {
          titleTag.textContent = `${title}`;
        }
        jsonTag.setAttribute('colspan', '1');
        jsonTag.className = 'icon';
        jsonIcon.removeClass('json-icon-large');
        jsonIcon.addClass('json-icon');
        jsonIcon.attr('id', `${uid}`);
        $('title', jsonIcon).text('View document JSON');
        jsonTag.appendChild(jsonIcon[0]);
        pathTag.setAttribute('colspan', '20');
        pathTag.className = 'doc-path';
        pathTag.textContent = `${path}`;
        searchResult.className = 'search-result';
        searchResult.appendChild(iconTag);
        searchResult.appendChild(titleTag);
        searchResult.appendChild(jsonTag);
        searchResultPath.appendChild(pathTag);
        $('tbody').append(searchResult);
        $('tbody').append(searchResultPath);
      }

      function docSearch(nxqlQuery, input) {
        nuxeo.repository()
          .schemas(['dublincore', 'common', 'uid'])
          .query({
            query: nxqlQuery,
            sortBy: 'dc:modified',
          })
          .then((res) => {
            if ((res.entries).length > 0) {
              $('.no-result').css('display', 'none');
              $('body').css('overflow-y', 'auto');
              const thead = document.createElement('thead');
              const tr = document.createElement('tr');
              const th = document.createElement('th');
              const tbody = document.createElement('tbody');
              th.setAttribute('colspan', '20');
              th.textContent = 'Search Results:';
              tr.appendChild(th);
              thead.appendChild(tr);
              $('#search-results').append(thead);
              $('#search-results').append(tbody);
              $('table').css('margin-top', '20px');
              (res.entries).forEach((doc) => {
                $('html').outerHeight($('html').height());
                const icon = doc.get('common:icon');
                const title = doc.get('dc:title');
                const re = /^(.*[\/])/;
                const path = (re.exec(doc.path))[1];
                const uid = doc.uid;
                const vMajor = doc.get('uid:major_version');
                const vMinor = doc.get('uid:minor_version');
                showSearchResults(icon, title, path, uid, vMajor, vMinor);
              });
              $('.doc-title').click((event) => {
                let docURL;
                if (onUI) {
                  docURL = nuxeo._baseURL.concat(`ui/#!/doc/${event.target.id}`);
                } else {
                  docURL = nuxeo._baseURL.concat(`nxdoc/default/${event.target.id}/view_documents`);
                }
                app.browser.createTabs(docURL, bkg.studioExt.server.tabId);
              });
              $('.json-icon').click((event) => {
                event.preventDefault();
                getJsonFromGuid(event.target.id);
              });
            } else {
              const searchTerm = DOMPurify.sanitize(input);
              $('.no-result span').text(searchTerm);
              $('.no-result').css('display', 'block');
            }
            $('#loading-gif').css('display', 'none');
            $('#search').css('text-indent', '5px');
          })
          .catch((error) => {
            error.response.json().then((json) => {
              bkg.notification('error', json.code, json.message, '../images/access_denied.png');
              $('#loading-gif').css('display', 'none');
              $('#search').css('text-indent', '5px');
            });
          });
      }

      let openJsonWindow = (jsonObject) => {
        const jsonString = JSON.stringify(jsonObject, undefined, 2);
        bkg._text = DOMPurify.sanitize(jsonString);
        app.browser.createTabs('json.html', bkg.studioExt.server.tabId);
      };

      $('#restart-button').confirm({
        title: 'Warning!',
        text: 'Are you sure you want to restart the server?',
        confirmButton: 'Restart',
        cancelButton: 'Cancel',
        confirm: () => {
          bkg.restart(startLoadingRS, stopLoading);
        },
      });

      $('#reindex-repo').click(() => {
        $('#reindex-form').css('display', 'none');
        $('#reindex-repo').button('toggle');
      });
      $('#reindex-nxql').click(() => {
        $('#reindex-form').css('display', 'block');
        $('#reindex-repo').button('toggle');
      });
      $('#reindex').click(() => {
        if ($('#reindex-repo').hasClass('active')) {
          bkg.reindex();
        } else {
          $('#reindex-form').show();
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          const input = $('#reindex-input').val();
          $('#reindex-input').val('');
          const matchGroupId = uuidPattern.exec(input);
          if (matchGroupId) {
            bkg.reindexDocId(input);
          } else {
            bkg.reindexNXQL(input);
          }
        }
      });

      $('#nxql-docid').keydown((e) => {
        if (e.which === 13) {
          e.preventDefault();
          $('#reindex-nxql-doc').click();
        }
      });

      $('#traces-button').click(() => {
        nuxeo.operation('Traces.ToggleRecording')
          .params({ readOnly: false })
          .execute()
          .then((response) => {
            if (response.value) {
              $('#traces-button').addClass('enabled');
              if ($('#traces-button').hasClass('disabled')) {
                $('#traces-button').removeClass('disabled');
              }
            } else {
              $('#traces-button').addClass('disabled');
              if ($('#traces-button').hasClass('enabled')) {
                $('#traces-button').removeClass('enabled');
              }
            }
          })
          .catch(() => {
            nuxeo.operation('Traces.ToggleRecording')
              .params({ readOnly: true })
              .execute()
              .then((response) => {
                if (response.value) {
                  $('#traces-button').addClass('enabled');
                  $('#traces-button').removeClass('disabled');
                } else {
                  $('#traces-button').addClass('disabled');
                  $('#traces-button').removeClass('enabled');
                }
              });
          });
      });

      $('#search').keydown(() => {
        $('#loading-gif').css({ display: 'inline' });
        $('#search').css('text-indent', '23px');
      });

      $('#search').keyup(debounce(() => {
        $('#search-results').empty();
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const pathPattern = /^\//;
        const input = $('#search').val();
        if (input === '') {
          $('.no-result').css('display', 'none');
          $('#search-results').empty();
          $('#loading-gif').css('display', 'none');
          $('#search').css('text-indent', '5px');
          $('body').css('overflow-y', 'hidden');
          $('html').css('height', 'auto');
        } else if (uuidPattern.test(input)) {
          getJsonFromGuid(input);
          $('#loading-gif').css('display', 'none');
          $('#search').css('text-indent', '5px');
        } else if (pathPattern.test(input)) {
          getJsonFromPath(input);
          $('#loading-gif').css('display', 'none');
          $('#search').css('text-indent', '5px');
        } else if (((input.toUpperCase()).indexOf('SELECT ') !== -1)
          && ((input.toUpperCase()).indexOf(' FROM ') !== -1)) {
          const query = input.replace(/'/g, '"');
          docSearch(query, input);
          $('#loading-gif').css('display', 'none');
          $('#search').css('text-indent', '5px');
        } else {
          let searchTerm = input;
          if (searchTerm.indexOf('_') > -1) {
            searchTerm = searchTerm.replace(/_/g, '&UNDERSCORE');
          }
          if (searchTerm.indexOf('\\') > -1) {
            searchTerm = searchTerm.replace('\\', '&BACKSLASH');
          }
          if (searchTerm.indexOf('"') > -1) {
            searchTerm = searchTerm.replace('"', '\\"');
          }
          if (searchTerm.indexOf('\'') > -1) {
            searchTerm = searchTerm.replace('\'', '\\\'');
          }
          const jsonQuery = `SELECT * FROM Document WHERE ecm:fulltext = "${searchTerm}"`;
          docSearch(jsonQuery, input);
          $('#loading-gif').css('display', 'none');
          $('#search').css('text-indent', '5px');
        }
      }, 1000));
    });
  });
})(window);
