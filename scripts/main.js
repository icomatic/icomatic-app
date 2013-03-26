window.icomatic = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  application: null,
  init: function() {
    console.log('Hello from Backbone!');
/*    var iconModel = new icomatic.Models.IconModel({});
    var iconModels = [];
    iconModels.push(new icomatic.Models.IconModel({}));
    iconModels.push(new icomatic.Models.IconModel({}));
    iconModels.push(new icomatic.Models.IconModel({}));
    var icons = new icomatic.Collections.IconCollection(iconModels);
    var iconsView = new icomatic.Views.IconCollectionView({ collection: icons }); */
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
  
  switch (debug) {
    case 'preview':
      application.set('state', 'preview'); break;
    case 'export':
      application.generateFont(); application.set('state', 'export'); break;
    case 'purchase':
      application.set('state', 'purchase'); break;
    default:
      application.generateFont(); application.set('state', 'sample'); break;
  }
});
