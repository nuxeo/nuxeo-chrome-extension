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

'use strict';

(function (window) {
	var app = window.app = window.app || {};
  var studioExt = {};
  var tabUrl;
  var pkgName;

  var _AnalyticsCode = 'UA-79232642-1';
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', _AnalyticsCode]);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

  function trackButtonClick(e) {
    _gaq.push(['_trackEvent', e.target.id, 'clicked']);
  }

	function escapeHTML(str) {
	  return str.replace(/[&"'<>]/g, (m) => escapeHTML.replacements[m]);
	}
	escapeHTML.replacements = { '&': '&amp;', '"': '&quot;', '\'': '&#39;', '<': '&lt;', '>': '&gt;' };

  document.addEventListener('DOMContentLoaded', function () {
    var buttons = document.querySelectorAll('a');
    var debug = document.getElementById('debug-switch');
    var exportCurrent = document.getElementById('export-current');
    var jsonSearch = document.getElementById('json-search');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', trackButtonClick);
    };
    debug.addEventListener('click', trackButtonClick);
    exportCurrent.addEventListener('click', trackButtonClick);
    jsonSearch.addEventListener('click', trackButtonClick);
  });

  app.browser.getBackgroundPage(function(bkg) {
    function debounce(fn, delay) {
      var timer = null;
      return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    };

    var position;

    function startLoadingHR() {
        _gaq.push(['_trackEvent', 'hot-reload-button', 'clicked']);
        var a = $('a#hot-reload-button');
        position = a.position();
        $('#loading').css({'display': 'block', 'top': (position.top-5), 'left': (position.left-50)});
      };

    function startLoadingRS() {
        _gaq.push(['_trackEvent', 'restart-button', 'clicked']);
        var a = $('a#restart-button');
        position = a.position();
        $('#loading').css({'display': 'block', 'top': (position.top-5), 'left': (position.left+140)});
    };

    function stopLoading() {
        $('#loading').css('display', 'none');
    };

    function registerLink(element, url) {
      $(element).click(function() {
				app.browser.createTabs(url, bkg.studioExt.server.tabId);
      });
    };

    $(document).ready(function() {

      $('#json-searchclear').click(function(){
        $('#json-search').val('');
        $('.no-result').css('display', 'none');
				$('#json-search-results').empty();
				$('body').css('overflow-y', 'hidden');
				$('html').outerHeight(height+66);
      });

			$('#nxql-clear').click(function(){
        $('#nxql-docid').val('');
			});


			var onUI;
      var nuxeo;
      bkg.getCurrentTabUrl(function(url) {

        nuxeo = bkg.newNuxeo({
          baseURL: url
        });

        bkg.readStudioProject((text) => {
          const pkgName = JSON.parse(text).studio;
          if (pkgName) {
            $('#studio-link-button, #hot-reload-button').attr('class', 'button main-page');
            $('#studio-link-button').click(function() {
              _gaq.push(['_trackEvent', 'studio-link-button', 'clicked']);

              const studioUrl = `https://connect.nuxeo.com/nuxeo/site/studio/ide?project=${pkgName}`;
              app.browser.createTabs(studioUrl, bkg.studioExt.server.tabId);
            });
            $('#hot-reload-button').click(function() {
              bkg.bkgHotReload(startLoadingHR, stopLoading);
            });
          } else {
            $('#studio-link-button, #hot-reload-button').click(function() {
              bkg.notification('no_studio_project', 'No associated Studio project', 'If you\'d like to use this function, please associate your Nuxeo server with a studio project' , '../images/access_denied.png');
            });
          }
        });

        nuxeo.operation('Traces.ToggleRecording')
          .params({readOnly: true})
          .execute()
          .then(function(response) {
            $('#debug-switch').attr('checked', response.value);
          });

				var serverString = escapeHTML(nuxeo._baseURL)
        $('div.server-name-url').html(serverString);

        var serverURL = nuxeo._baseURL.replace(/\/$/, '');

        registerLink('#autodoc-button', nuxeo._baseURL.concat('site/automation/doc/'));
        registerLink('#api-pg-link', 'http://nuxeo.github.io/api-playground/');
        registerLink('#api-button', ('http://nuxeo.github.io/api-playground/#/').concat(serverURL));
        registerLink('#explorer-link', 'https://explorer.nuxeo.com');
        registerLink('#nxql-link', 'https://doc.nuxeo.com/display/NXDOC/NXQL');
        registerLink('#el-scripting-link', 'https://doc.nuxeo.com/display/NXDOC/Understand+Expression+and+Scripting+Languages+Used+in+Nuxeo');
        registerLink('#mvel-link', 'https://doc.nuxeo.com/display/NXDOC/Use+of+MVEL+in+Automation+Chains');
        registerLink('#workflow-variables-link', 'https://doc.nuxeo.com/display/NXDOC/Variables+Available+in+the+Automation+Context');
        registerLink('#escalation-rules-link', 'https://doc.nuxeo.com/display/NXDOC/Escalation+Service');
        registerLink('#nxelements-link', 'https://elements.nuxeo.com/');
        registerLink('#nxlayouts-link', 'http://showcase.nuxeo.com/nuxeo/layoutDemo/');
        registerLink('#style-guide-link', 'http://showcase.nuxeo.com/nuxeo/styleGuide/');

        var uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        var pathPattern = /^\//;
        var docPattern = /nxpath\/[A-Za-z_\.0-9-]+(\/[A-Za-z\.0-9_\- \/%~:?#]+)|(?:nxdoc[\/A-Za-z_\.0-9]+)([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/;
				var uiDocPattern = /nuxeo\/ui\/#!\/browse(\/[A-Za-z\.0-9_\- \/%~:?#]+)|(?:nuxeo\/ui\/#!\/doc[\/A-Za-z_\.0-9]+)([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/;
				var matchGroupDoc = docPattern.exec(bkg.tabUrl);
				var matchGroupUiDoc = uiDocPattern.exec(bkg.tabUrl);

				function exportCurrentLink(docPath) {
					$('#export-current').css('display', 'block');
          $('#export-current').click(function(event) {
            if (uuidPattern.test(docPath)) {
              getJsonFromGuid(docPath);
            } else if (pathPattern.test(docPath)) {
              getJsonFromPath(docPath);
            };
          });
				};

				if (matchGroupDoc) {
					onUI = false;
					if (matchGroupDoc[1]) {
						exportCurrentLink(matchGroupDoc[1]);
					} else if (matchGroupDoc[2]) {
						exportCurrentLink(matchGroupDoc[2]);
					};
				} else if (matchGroupUiDoc) {
					onUI = true;
					if (matchGroupUiDoc[1]) {
						exportCurrentLink(matchGroupUiDoc[1]);
	        } else if (matchGroupUiDoc[2]) {
						exportCurrentLink(matchGroupUiDoc[2]);
					};
				};

			});

      function getJsonFromPath(input) {
        nuxeo.request('/path/' + input)
          .schemas('*')
          .enrichers({ document: ['acls', 'permissions'] })
          .get()
          .then(openJsonWindow)
          .catch(function(error) {
            throw new Error(error);
          });
      };

      function getJsonFromGuid(input) {
        nuxeo.request('/id/' + input)
          .schemas('*')
          .enrichers({ document: ['acls', 'permissions'] })
          .get()
          .then(openJsonWindow)
          .catch(function(error) {
            throw new Error(error);
          });
      };

			var height = $('html').height();

			function docSearch(nxqlQuery, input) {
				nuxeo.repository()
				.schemas(['dublincore', 'common', 'uid'])
				.query({
					query: nxqlQuery,
					sortBy: 'dc:modified'
				})
				.then(function(res) {
					if ((res.entries).length > 0) {
						$('body').css('overflow-y', 'auto');
						$('#json-search-results').append('<thead><tr><th colspan=20>Search Results:</td></tr></thead><tbody></tbody>');
						$('table').css('margin-top', '20px');
						(res.entries).forEach(function(doc) {
							$('html').outerHeight($('html').height());
							var icon = doc.get('common:icon');
							var title = doc.get('dc:title');
							var re = /^(.*[\/])/;
							var path = (re.exec(doc.path))[1];
							var uid = doc.uid;
							var vMajor = doc.get('uid:major_version');
							var vMinor = doc.get('uid:minor_version');
							showSearchResults(icon, title, path, uid, vMajor, vMinor);
						});
						$('.doc-title').click(function(event) {
							if (onUI) {
								var docURL = nuxeo._baseURL.concat('ui/#!/doc/' + event.target.id);
							} else {
								var docURL = nuxeo._baseURL.concat('nxdoc/default/' + event.target.id + '/view_documents');
							};
							app.browser.createTabs(docURL, bkg.studioExt.server.tabId);
						})
						$('.json-icon').click(function(event) {
							event.preventDefault();
							getJsonFromGuid(event.target.id);
						});
					} else {
						var searchTerm = escapeHTML(input);
						$('.no-result span').text(searchTerm);
						$('.no-result').css('display', 'block');
					};
					$('#loading-gif').css('display', 'none');
					$('#json-search').css('text-indent', '5px');
				})
				.catch(function(error) {
					error.response.json().then(function(json) {
						bkg.notification('error', json.code, json.message, '../images/access_denied.png');
						$('#loading-gif').css('display', 'none');
						$('#json-search').css('text-indent', '5px');
					});
				});
			};

      var openJsonWindow = function(jsonObject) {
        var w = 600;
        var h = 800;
        var left = (screen.width/2)-(w/2);
        var top = (screen.height/2)-(h/2);
        var jsonString = JSON.stringify(jsonObject, undefined, 2);
        bkg._text = escapeHTML(jsonString);
				app.browser.createTabs('json.html', bkg.studioExt.server.tabId);
      };

      function showSearchResults(icon, title, path, uid, vMajor, vMinor) {
				var title_tag;
        var icon_link = nuxeo._baseURL.concat(icon);
        var icon_tag = '<td colspan=1 class="icon"><img class="doc-icon" src="' + icon_link + '" alt="icon"></td>';
        if ((typeof vMajor != 'undefined' && typeof vMinor != 'undefined')) {
					title_tag = '<td colspan=17 class="doc-title" id="' + uid + '">' + title + ' <span class="version">' + vMajor + '.' + vMinor + '</span></td>';
				} else {
					title_tag = '<td colspan=17 class="doc-title" id="' + uid + '">' + title + '</td>';
				};
				var json_tag = '<td colspan=2 class="icon"><img class="json-icon" id="' + uid + '" src="images/json-exp.png"></td>';
        var path_tag = '<td colspan=20 class="doc-path">' + path + '</td>';
        $('tbody').append('<tr class="search-result">'+ icon_tag + title_tag + json_tag + '</tr><tr>' + path_tag + '</tr>');
      };

      $('#restart-button').confirm({
        title: 'Warning!',
        text: 'Are you sure you want to restart the server?',
        confirmButton: 'Restart',
        cancelButton: 'Cancel',
        confirm: function() {
          bkg.restart(startLoadingRS, stopLoading);
        }
      });

      $('#reindex-repo').click(function() {
        bkg.reindex();
      });

			$('#reindex-nxql-doc').click(function() {
				var uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
				var input = $('#nxql-docid').val();
	      $('#nxql-docid').val('');
				var matchGroupId = uuidPattern.exec(input);
				if (matchGroupId) {
        	bkg.reindexDocId(input);
				} else {
					bkg.reindexNXQL(input);
				}
      });

			$('#nxql-docid').keydown(function (e) {
			  if (e.which == 13) {
					e.preventDefault();
					$('#reindex-nxql-doc').click();
			  }
			});

      $('#debug-switch').click(function(event) {
        nuxeo.operation('Traces.ToggleRecording')
          .params({readOnly: false})
          .execute()
          .then(function(response) {
            $('#debug-switch').attr('checked', response.value);
          })
      });

      $('#json-search').keydown(function() {
        $('#loading-gif').css({'display': 'inline'});
				$('#json-search').css('text-indent', '23px');
      });

      $('#json-search').keyup(debounce(function() {
        $('#json-search-results').empty();
        var uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        var pathPattern = /^\//;
        var input = $('#json-search').val();
        if (input == '') {
          $('.no-result').css('display', 'none');
          $('#json-search-results').empty();
          $('#loading-gif').css('display', 'none');
					$('#json-search').css('text-indent', '5px');
					$('body').css('overflow-y', 'hidden');
					$('html').outerHeight(height+66);
        } else if (uuidPattern.test(input)) {
          getJsonFromGuid(input);
          $('#loading-gif').css('display', 'none');
					$('#json-search').css('text-indent', '5px');
        } else if (pathPattern.test(input)) {
          getJsonFromPath(input);
          $('#loading-gif').css('display', 'none');
					$('#json-search').css('text-indent', '5px');
        } else if (((input.toUpperCase()).indexOf('SELECT ') !== -1) && ((input.toUpperCase()).indexOf(' FROM ') !== -1)) {
					var query = input.replace(/'/g, '"');
					docSearch(query, input);
          $('#loading-gif').css('display', 'none');
					$('#json-search').css('text-indent', '5px');
				} else {
          var jsonQuery = 'SELECT * FROM Document WHERE ecm:fulltext = "' + input + '"';
          docSearch(jsonQuery, input);
          $('#loading-gif').css('display', 'none');
					$('#json-search').css('text-indent', '5px');
        };
      }, 1000));
    });
  });
})(window);
