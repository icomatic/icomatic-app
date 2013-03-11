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

$(document).ready(function(){
  icomatic.init();
  var debug = document.querySelector('body').getAttribute('data-debug-state');
  if (!debug)
    return;

  application.addIcon('dummy1', "<svg width='100%' height='100%' viewBox='0 0 100 100'><path fill='#ccc' d='M0,0h100v100z'/></svg>");
  application.addIcon('dummy2', "<svg width='100%' height='100%' viewBox='0 0 100 100'><path fill='#ccc' d='M0,0h100v100z'/></svg>");
  application.addIcon('dummy3', "<svg width='100%' height='100%' viewBox='0 0 100 100'><path fill='#ccc' d='M0,0h100v100z'/></svg>");
  
  if (debug === 'preview')
    application.set('state', 'preview');
  else
    application.generateFont();

});
