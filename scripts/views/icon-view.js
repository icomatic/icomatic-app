icomatic.Views.IconView = Backbone.View.extend({
template: _.template(
'<div class=\'square thumbnail\'>\
  <%= svg %>\
</div>\
<p><%= name %></p>'
),
tagName: 'li',
className: 'span2',
render: function() {
    var result = this.template({ svg: this.model.get('svg'), name: this.model.get('name') });
    this.el.innerHTML = result;
    return this;
}
});
