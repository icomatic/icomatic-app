window.icomatic = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  init: function() {
    console.log('Hello from Backbone!');
/*    var iconModel = new icomatic.Models.IconModel({});
    var iconModels = [];
    iconModels.push(new icomatic.Models.IconModel({}));
    iconModels.push(new icomatic.Models.IconModel({}));
    iconModels.push(new icomatic.Models.IconModel({}));
    var icons = new icomatic.Collections.IconCollection(iconModels);
    var iconsView = new icomatic.Views.IconCollectionView({ collection: icons }); */
    var application = new icomatic.Models.ApplicationModel();
    var applicationView = new icomatic.Views.ApplicationView({ model: application });
    document.getElementById('container').appendChild(applicationView.render().el);
  }
};

$(document).ready(function(){
  icomatic.init();
});
