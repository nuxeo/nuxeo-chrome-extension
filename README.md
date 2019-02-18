Nuxeo Dev Tools
===============

![Chrome](app/images/chrome.png) [![Chrome Web Store](https://img.shields.io/chrome-web-store/d/kncphbjdicjganncpalklkllihdidcmh.svg)](https://chrome.google.com/webstore/detail/nuxeo-dev-tools/kncphbjdicjganncpalklkllihdidcmh?hl=en) &nbsp;&nbsp;&nbsp;&nbsp; ![Firefox](app/images/firefox.png) [![Mozilla Add-on](https://img.shields.io/amo/d/nuxeo-dev-tools.svg)](https://addons.mozilla.org/en-US/firefox/addon/nuxeo-dev-tools/)

[![Build Status](https://qa.nuxeo.org/jenkins/buildStatus/icon?job=Client/browser-developer-extension-master/master)](https://qa.nuxeo.org/jenkins/job/Client/job/browser-developer-extension-master/job/master/)

# About

This project puts some of the more commonly performed actions in the Nuxeo Platform at the administrator's fingertips in a convenient browser extension.

Features include:
* **Hot Reload** on related Studio project
* **Restart** server
* **Designer Live Preview**
  * See your Designer Web UI customizations without a hot reload -- just save in Designer and refresh your browser.
  * HTML import [currently unavailable](https://bugs.chromium.org/p/chromium/issues/detail?id=803115) in Chrome.
* Rebuild **Elasticsearch** Index
* Connect to **API Playground**
* Toggle **Automation Call Tracing**
* One-click **JSON export of document** in current active tab
* Useful Links menu
* **Document Search** (search with path, GUID, file name or NXQL query)
  * Click on search results to navigate to document or on ![export](app/images/json-exp.png) to export JSON
* **Chrome Omnibox**
  * Chrome users can access the **Nuxeo omnibox** by entering keyword `nx` in the URL box, then TAB.
  * Entering the correct path or GUID of an existing document will open the document JSON in a separate tab.
  * Entering text will perform a full-text search or you can enter an NXQL query.
  * Searches return the first 5 results in a dropdown window from the omnibox.
* Link to our **Customer Feedback Portal** from the About page. You can vote for requested features or even suggest your own, anonymously if you wish.

Click on the **Nuxeo** logo to modify options:
* Change the Connect URL.
* Turn off JSON highlighting to use your own JSON formatter plugin (from 10.10+).

# Installation

- From the Chrome Web Store: install [Nuxeo Dev Tools](https://chrome.google.com/webstore/detail/nuxeo-extension/kncphbjdicjganncpalklkllihdidcmh).
- From Mozilla's Add-ons page: install [Nuxeo Dev Tools](https://addons.mozilla.org/en-US/firefox/addon/nuxeo-dev-tools/).

## Requirements

* Nuxeo 8.2 +
* Install any available **hotfixes**.

## Limitations

* Multiple Studio projects are not supported.
* The extension is only active when a Nuxeo instance is in the current active tab.
* The **Hot Reload** and **Go To Studio** buttons are only active *when a Studio project is associated with the current Nuxeo server*.
* You must have **Administrator** access for some features.
* **Dev Mode** must be activated to benefit from the **Hot Reload** feature.
* [**CORS config**](https://doc.nuxeo.com/pages/viewpage.action?pageId=14257084) must be activated in your Nuxeo server to connect to your repository on API Playground.
* The extension does not work in **Incognito/Private** mode.


# Build


```
$ git clone git@github.com:nuxeo/nuxeo-browser-extension.git
$ cd nuxeo-browser-extension
$ npm install
$ gulp clean build
```

## Developers

Run `gulp watch` and load the unpacked extension in your preferred browser for your changes to be reloaded immediately.

### Firefox

  * Enter about:debugging in the address bar.
  * Click on **Load Temporary Add-on...**.
  * Select nuxeo-browser-extension/dist/**firefox/manifest.json**.


### Chrome

  * *Options* > *More Tools* > *Extensions*
  * Click on the **Load Unpacked** button.
  * Select nuxeo-browser-extension/dist/**chrome**.

### Tests
```
$ npm install
$ npm run test
```

...or build and run with Maven:
```
$ mvn clean verify -f ftest/pom.xml
```

### Releases

Major releases (new features):

```
gulp release:major
```

Minor releases (small improvements and bugfixes):
```
gulp release
```


# Contributing / Reporting issues

Create a ticket with a description of your bug on [JIRA](https://jira.nuxeo.com/browse/BDE/).

Please [tell us](https://portal.prodpad.com/40c295d6-739d-11e7-9e52-06df22ffaf6f) your suggestions for the Dev Tools extension, or any ideas for features that you'd like to see.


# License

[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

# About Nuxeo

The [Nuxeo Platform](http://www.nuxeo.com/products/content-management-platform/) is an open source customizable and extensible content management platform for building business applications. It provides the foundation for developing [document management](http://www.nuxeo.com/solutions/document-management/), [digital asset management](http://www.nuxeo.com/solutions/digital-asset-management/), [case management application](http://www.nuxeo.com/solutions/case-management/) and [knowledge management](http://www.nuxeo.com/solutions/advanced-knowledge-base/). You can easily add features using ready-to-use addons or by extending the platform using its extension point system.

The Nuxeo Platform is developed and supported by Nuxeo, with contributions from the community.

Nuxeo dramatically improves how content-based applications are built, managed and deployed, making customers more agile, innovative and successful. Nuxeo provides a next generation, enterprise ready platform for building traditional and cutting-edge content oriented applications. Combining a powerful application development environment with SaaS-based tools and a modular architecture, the Nuxeo Platform and Products provide clear business value to some of the most recognizable brands including Verizon, Electronic Arts, Sharp, FICO, the U.S. Navy, and Boeing. Nuxeo is headquartered in New York and Paris.

More information is available at [www.nuxeo.com](http://www.nuxeo.com).
