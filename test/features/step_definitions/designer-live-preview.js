/*
Copyright 2016-2019 Nuxeo

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

const { Given, Then, When } = require('cucumber');
const chai = require('chai');
const login = require('./support/fixtures/auth.js').login;
const findTabByTitle = require('./support/fixtures/nav.js').findTabByTitle;
const modifyDashboard = require('./support/client.js').modifyDashboard;
const getDashboard = require('./support/client.js').getDashboard;
const AfterAll = require('./support/hooks.js').AfterAll;
const Before = require('./support/hooks.js').Before;

const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const dashboardUrl = 'https://connect.nuxeo.com/nuxeo/site/studio/v2/project/bde-test/workspace/ws.resources/nuxeo.war/ui/nuxeo-home.html';

When(/^Designer Live Preview retrieves the modifications/, () => {
  const tabIds = browser.getTabIds();
  findTabByTitle('Nuxeo Dev Tools', tabIds);
  const isEnabled = browser.execute(() => window.isEnabled());
  const redirectedUrls = browser.execute(() => window.redirectedUrls);
  const dashboardModified = Object.values(redirectedUrls.value).indexOf(dashboardUrl) > -1;
  assert(isEnabled.value.should.be.true
    && redirectedUrls.value.should.not.be.empty
    && dashboardModified.should.be.true);
});

Then(/^my changes can be seen in the dashboard/, () => getDashboard(connectUsr, connectPsw)
  .then(dashboard => assert(dashboard.indexOf('TESTING TESTING 123...') > -1)));
