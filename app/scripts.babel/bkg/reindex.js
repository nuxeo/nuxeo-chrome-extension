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

window.reindex = function () {
  let nuxeo;
  getCurrentTabUrl((url) => {
    nuxeo = newNuxeo({
      baseURL: url,
    });
    nuxeo.operation('Elasticsearch.Index').execute()
      .then(() => {
        notification('success', 'Success!', 'Your repository index is rebuilding.', '../images/nuxeo-128.png', false);
      })
      .catch((e) => {
        console.error(e);
        notification('error', 'Something went wrong...', 'Please try again later.', '../images/access_denied.png', false);
      });
  });
};

window.reindexNXQL = function (input) {
  let nuxeo;
  getCurrentTabUrl((url) => {
    nuxeo = newNuxeo({
      baseURL: url,
    });
    nuxeo.operation('Elasticsearch.Index')
      .input(input)
      .execute()
      .then(() => {
        notification('success', 'Success!', 'Your repository index is rebuilding.', '../images/nuxeo-128.png', false);
      })
      .catch((e) => {
        console.error(e);
        notification('error', 'Something went wrong...', 'Please try again later.', '../images/access_denied.png', false);
      });
  });
};

window.reindexDocId = function (input) {
  let nuxeo;
  getCurrentTabUrl((url) => {
    nuxeo = newNuxeo({
      baseURL: url,
    });
    nuxeo.operation('Elasticsearch.Index')
      .input(input)
      .execute()
      .then(() => {
        notification('success', 'Success!', 'Your repository index is rebuilding.', '../images/nuxeo-128.png', false);
      })
      .catch((e) => {
        console.error(e);
        notification('error', 'Something went wrong...', 'Please try again later.', '../images/access_denied.png', false);
      });
  });
};
