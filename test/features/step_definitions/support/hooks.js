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

const { AfterAll, Before } = require('cucumber');
const revertDashboard = require('./client.js').revertDashboard;

function isTagged(tag, scenario) {
  return scenario.pickle.tags.find(o => o.name === tag);
}

// Workaround: Before/After hooks in wdio.conf.js do not wait for Promises
AfterAll(() => revertDashboard(connectUsr, connectPsw));

Before((scenario) => {
  const tabIds = browser.getTabIds();
  if (tabIds.length > 2) {
    for (let i = 2; i < tabIds.length; i += 1) {
      browser.switchTab(tabIds[i]);
      browser.close();
    }
  }
});

module.exports = {
  AfterAll,
  Before,
};
