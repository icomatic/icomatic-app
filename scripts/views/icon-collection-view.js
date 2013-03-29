icomatic.Views.IconCollectionView = Backbone.View.extend({
    tagName: 'ul',
    className: 'icons',
    initialize: function() {
        this.collection.on('add', this.render, this);
    },
    render: function() {
        this.el.innerHTML = '';
        this.collection.each(function(icon) {
            this.el.appendChild((new icomatic.Views.IconView({ model: icon })).render().el);
        }, this);
        return this;
    }
  //template: icon_collection

});
