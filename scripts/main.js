window.icomatic = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  application: null,
  init: function() {
    console.log('Hello from Backbone!');
    application = new icomatic.Models.ApplicationModel();
    var applicationView = new icomatic.Views.ApplicationView({ model: application });
    document.getElementById('container').appendChild(applicationView.render().el);
  }
};

function getQueryVariable(variable)
{
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

$(document).ready(function(){
  icomatic.init();
  var debug = getQueryVariable('state');
  if (!debug)
    return;

  application.addIcon('dummy1', "<svg width='100%' height='100%' viewBox='0 0 100 100'><path fill='#ccc' d='M0,0h100v100z'/></svg>");
  application.addIcon('dummy2', "<svg width='100%' height='100%' viewBox='0 0 100 100'><path fill='#ccc' d='M0,0h100v100z'/></svg>");
  application.addIcon('dummy3', "<svg width='100%' height='100%' viewBox='0 0 100 100'><path fill='#ccc' d='M0,0h100v100z'/></svg>");
  
  application.generateFont();

  switch (debug) {
    case 'upload':
    case 'preview':
    case 'download':
    case 'purchase':
    case 'sample':
      application.set('state', debug);
    default:
      break;
  }
});
