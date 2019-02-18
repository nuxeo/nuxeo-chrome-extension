$(() => {
  const date = new Date().getFullYear();
  $('#copyright').append(`${date} Nuxeo`);
  app.browser.getBackgroundPage((bkg) => {
    $('#apache').click(() => {
      app.browser.createTabs('http://www.apache.org/licenses/LICENSE-2.0', bkg.studioExt.server.tabId);
    });
    $('#feedback').click(() => {
      app.browser.createTabs('https://portal.prodpad.com/40c295d6-739d-11e7-9e52-06df22ffaf6f', bkg.studioExt.server.tabId);
    });
  });
});
