
let tabUrl;
let docUrl;

function pageActionOnNuxeo(tabInfo) {
	const re = /.*\.nuxeo$/;
	const login = '/login.jsp';
	tabUrl = tabInfo.url;
	chrome.cookies.getAll({
		url: tabUrl,
		name: 'JSESSIONID',
	}, (cookies) => {
		chrome.pageAction.hide(tabInfo.id);
		cookies.forEach((cookie) => {
			if ((cookie.value).match(re) && ((tabUrl).indexOf(login) < 0)) {
				chrome.pageAction.show(tabInfo.id);
			}
		});
	});
}

function disableExt(tabInfo) {
	chrome.pageAction.hide(tabInfo.id);
}

function getInfoForTab(tabs) {
	if (tabs.length > 0) {
		chrome.tabs.get(tabs[0].id, pageActionOnNuxeo);
	}
}

function getTabToDisable(tabs) {
	if (tabs.length > 0) {
		chrome.tabs.get(tabs[0].id, disableExt);
	}
}

function onChange() {
	chrome.tabs.query({ lastFocusedWindow: true, active: true }, getInfoForTab);
}

function disableTabExtension() { // eslint-disable-line no-unused-vars
	chrome.tabs.query({ lastFocusedWindow: true, active: true }, getTabToDisable);
}

const target = '<all_urls>';
chrome.webRequest.onCompleted.addListener(onChange, { urls: [target] });
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, pageActionOnNuxeo);
});

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const pathPattern = /^\//;
const webuiPattern = /nuxeo\/ui\/#!\//;

function createTabs(url, tabId) {
	chrome.tabs.query({
		active: true,
	}, (tabs) => {
		const index = tabs[0].index;
		chrome.tabs.create({
			url,
			openerTabId: tabId,
			selected: false,
			index: index + 1,
		});
	});
}

function openDocFromId(id, url) {
	const onWebUI = webuiPattern.exec(tabUrl);
	nuxeo.request(`/id/${id}`)
		.schemas('*')
		.enrichers({ document: ['acls', 'permissions'] })
		.get()
		.then((doc) => {
			if (onWebUI) {
				docUrl = url.concat(`ui/#!/doc/${doc.uid}`);
			} else {
				docUrl = url.concat(`nxdoc/default/${doc.uid}'/view_documents`);
			}
			createTabs(docUrl, studioExt.server.tabId);
		})
		.catch((error) => {
			console.log(error);
		});
}

function openDocFromPath(path, url) {
	const onWebUI = webuiPattern.exec(tabUrl);
	nuxeo.request(`/path/${path}`)
		.schemas('*')
		.enrichers({ document: ['acls', 'permissions'] })
		.get()
		.then((doc) => {
			if (onWebUI) {
				docUrl = url.concat(`ui/#!/doc/${doc.uid}`);
			} else {
				docUrl = url.concat(`nxdoc/default/${doc.uid}/view_documents`);
			}
			createTabs(docUrl, studioExt.server.tabId);
		})
		.catch((error) => {
			console.log(error);
		});
}

function encodeXml(str) {
	const holder = document.createElement('div');
	holder.textContent = str;
	return holder.innerHTML;
}

chrome.omnibox.onInputChanged.addListener(
	(text, suggest) => {
		getCurrentTabUrl((url) => {
			nuxeo = new Nuxeo({
				baseURL: url,
			});
			if (((text.toUpperCase()).indexOf('SELECT ') !== -1) && ((text.toUpperCase()).indexOf(' FROM ') !== -1)) {
				const query = text.replace(/'/g, '"');
				const suggestions = [];
				nuxeo.repository()
					.schemas(['dublincore', 'common', 'uid'])
					.query({
						query,
						sortBy: 'dc:modified',
					})
					.then((res) => {
						if ((res.entries).length > 0) {
							(res.entries).forEach((doc) => {
								suggestions.push({
									content: doc.uid,
									description: `<match>${encodeXml(doc.title)}</match> <dim>${encodeXml(doc.path)}</dim>`,
								});
							});
						}
						if ((res.entries).length > 5) {
							chrome.omnibox.setDefaultSuggestion({
								description: '<dim>Want more results? Try the</dim> <match>fulltext searchbox</match> <dim>from the Nuxeo Dev Tools extension window.</dim>',
							});
						}
						suggest(suggestions);
					});
			} else if (uuidPattern.test(text)) {
				openDocFromId(text, url);
			} else if (pathPattern.test(text)) {
				openDocFromPath(text, url);
			} else {
				const jsonQuery = `SELECT * FROM Document WHERE ecm:fulltext = "${text}"`;
				const query = jsonQuery.replace(/'/g, '"');
				const suggestions = [];
				nuxeo.repository()
					.schemas(['dublincore', 'common', 'uid'])
					.query({
						query,
						sortBy: 'dc:modified',
					})
					.then((res) => {
						if ((res.entries).length > 0) {
							(res.entries).forEach((doc) => {
								suggestions.push({
									content: doc.uid,
									description: `<match>${encodeXml(doc.title)}</match> <dim>${encodeXml(doc.path)}</dim>`,
								});
							});
						}
						if ((res.entries).length > 5) {
							chrome.omnibox.setDefaultSuggestion({
								description: '<dim>Want more results? Try the</dim> <match>fulltext searchbox</match> <dim>from the Nuxeo Dev Tools extension window.</dim>',
							});
						}
						suggest(suggestions);
					});
			}
		});
	});

chrome.omnibox.onInputEntered.addListener(
	(text) => {
		getCurrentTabUrl((url) => {
			nuxeo = new Nuxeo({
				baseURL: url,
			});
			if (uuidPattern.test(text)) {
				openDocFromId(text, url);
			} else if (pathPattern.test(text)) {
				openDocFromPath(text, url);
			}
		});
	});
