icomatic.Views.IconView = Backbone.View.extend({
tagName: 'li',
className: 'span2',
render: function() {
    var elem = document.createElement('div');
    elem.setAttribute('class', 'square thumbnail');
    elem.innerHTML = this.model.get('svg');
    this.el.appendChild(elem);
    elem = document.createElement('p');
    elem.innerText = this.model.get('name');
    this.el.appendChild(elem);
    return this;
}
  //template: icon

});
