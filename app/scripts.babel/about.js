function escapeHTML(str) {
  return str.replace(/[&"'<>]/g, (m) => escapeHTML.replacements[m]);
}
escapeHTML.replacements = { '&': '&amp;', '"': '&quot;', '\'': '&#39;', '<': '&lt;', '>': '&gt;' };

function updateCopyright() {
  var date = new Date().getFullYear();
  $('#copyright').html('&#169; ' + date + ' Nuxeo');
}

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