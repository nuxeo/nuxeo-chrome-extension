function escapeHTML(str) {
  return str.replace(/[&"'<>]/g, (m) => escapeHTML.replacements[m]);
}
escapeHTML.replacements = { '&': '&amp;', '"': '&quot;', '\'': '&#39;', '<': '&lt;', '>': '&gt;' };

function updateCopyright() {
  var date = new Date().getFullYear();
  $('#copyright').html('&#169; ' + date + ' Nuxeo');
}

app.browser.getBackgroundPage(function(bkg) {
  $('#apache').click(function() {
    app.browser.createTabs('http://www.apache.org/licenses/LICENSE-2.0', bkg.studioExt.server.tabId);
  });
});

$.ajax({
  method: 'GET',
  url: 'manifest.json',
  dataType: 'json',
  mimeType: 'application/json',
  success: function(data){
    var version = escapeHTML(data.version);
    $('#version').html(version);
    updateCopyright();
  }
});