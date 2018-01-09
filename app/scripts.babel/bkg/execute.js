
window.executeScript = (script, stopSearch, callback) => {
  const blob = new Nuxeo.Blob({
    content: new Blob([script], {
      type: 'text/plain',
    }),
    name: 'readPackage.groovy',
    mymeType: 'text/plain',
  });

  newDefaultNuxeo()
    .operation('RunInputScript')
    .params({
      type: 'groovy',
    })
    .input(blob)
    .execute()
    .then(res => res.text())
    .then(callback)
    .catch((e) => {
      if (stopSearch) {
        stopSearch();
      }
      console.error(e);
    });
};
