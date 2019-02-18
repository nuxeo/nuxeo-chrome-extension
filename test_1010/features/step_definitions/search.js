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
const expect = require('chai').expect;

When(/I enter (.+) in (.+) input/, (text, selector) => {
  browser.$(`#${selector}`).addValue(text);
  // Wait until debouncing is ok
  browser.waitForVisible('#loading-gif');
  browser.screenshot();
  browser.waitForVisible('#loading-gif', 2000, true);
});

Then(/I wait until (.+) appears/, (selector) => {
  browser.waitForExist(`${selector} > *`);
  browser.screenshot();
});

Then(/the server responds with (\d+) documents?/, (size) => {
  expect(browser.$('#search-results').$$('.search-result').length).to.equal(Number.parseInt(size));
});

Then(/the #(\d+) document title is (.+) and the parent path is (.+)/, (index, title, parentPath) => {
  const trs = browser.$$('#search-results tbody tr');
  const trTitle = trs[index - 1];
  const trPath = trs[index];

  expect(trTitle.$('.doc-title').getText()).to.equal(title);
  expect(trPath.$('.doc-path').getText()).to.equal(parentPath);
});
