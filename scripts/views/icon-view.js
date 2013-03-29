icomatic.Views.IconView = Backbone.View.extend({
template: _.template(
'<div class=\'icon\'>\
  <%= svg %>\
</div>\
<div class=\'icon-label\'><%= name %></div>'
),
tagName: 'li',
className: '',
render: function() {
    var result = this.template({ svg: this.model.get('svg'), name: this.model.get('name') });
    this.el.innerHTML = result;
    return this;
}
});
