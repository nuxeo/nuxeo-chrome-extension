import path from 'path';
import nuxeo from '../services/client';

global.liveDocuments = [];

fixtures.documents = {
  init: (docType) => {
    const title = `My_${docType}`;
    const doc = {
      'entity-type': 'document',
      name: title.replace(/[^a-z0-9.]/gi, '_'),
      type: docType.trim(),
      properties: {
        'dc:title': title,
      },
    };
    return doc;
  },
  create: (parent, document) => nuxeo.repository().create(parent, document).then((doc) => {
    liveDocuments.push(doc.path);
    return doc;
  }),
  delete: docPath => nuxeo.repository().delete(docPath).then(() => {
    liveDocuments.splice(liveDocuments.indexOf(docPath), 1);
  }),
};

module.exports = function () {
  this.Before(() => nuxeo.repository().fetch('/default-domain').then((doc) => { this.doc = doc; }));

  this.After(() => Promise.all(liveDocuments
    .filter(doc => path.dirname(doc) === '/default-domain')
    .map(doc => nuxeo.repository().delete(doc)))
    .then(() => { liveDocuments = []; }));
};
