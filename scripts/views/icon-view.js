icomatic.Views.IconView = Backbone.View.extend({
events: {
    'blur .icon-label': 'blurHandler',
    'focus .icon-label': 'focusHandler',
    'keydown .icon-label': 'keydownHandler'
},
template: _.template(
'<div class=\'icon\'>\
  <%= svg %>\
</div>\
<div class=\'icon-label\' contenteditable><%= name %></div>'
),
tagName: 'li',
className: '',
render: function() {
    var result = this.template({ svg: this.model.get('svg'), name: this.model.get('name') });
    this.el.innerHTML = result;
    return this;
},
blurHandler: function(event) {
    var label = this.el.querySelector('.icon-label');
    var content = label.innerHTML;
    if (content === label.getAttribute('data-value'))
        return;
    this.model.set('name', content);
},
focusHandler: function(event) {
    var label = this.el.querySelector('.icon-label');
    label.setAttribute('data-value', this.model.get('name'));
},
keydownHandler: function(event) {
    if (event.keyCode == 13)
        this.el.querySelector('.icon-label').blur();
}
});
