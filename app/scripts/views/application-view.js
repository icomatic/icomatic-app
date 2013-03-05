icomatic.Views.ApplicationView = Backbone.View.extend({
tagName: 'div',
className: 'container-fluid',
events: {
    'change #picker': 'filesPicked',
    'click #button' : 'clickHandler'
},
initialize: function() {
    var model = this.model;
    // check this
    model.on('change', this.render, this);
},
render: function() {
    this.el.innerHTML = '<div class=\'row-fluid\' style=\'margin-top:2em\'><div class=\'span3\'></div><div class=\'span9\'></div></div>';
    var picker, iconsView, button, div, state;
    state = this.model.get('state');
    div = this.el.querySelector('.span3');
    var content = [];
    content.push('<ol id=\'steplist\' class=\'nav nav-list\'>');
    content.push('    <li class=\'nav-header\'>3 Easy Steps</li>');
    content.push('    <li' + (state === 'upload' ? ' class=\'active\'' : '') + '>1. Upload Your Vector Icons</li>');
    content.push('    <li' + (state === 'preview' ? ' class=\'active\'' : '') + '>2. Preview Icons</li>');
    content.push('    <li' + (state === 'export' ? ' class=\'active\'' : '') + '>3. Download Your Icon Font</li>');
    content.push('</ol>');
    div.innerHTML = content.join('\n');
    div = this.el.querySelector('.span9');
    switch(this.model.get('state')) {
    case 'upload':
        div = div.appendChild(document.createElement('div'));
        div.style.setProperty('position', 'relative');
        div.setAttribute('class', 'btn btn-large');
        div.innerText = 'Upload Files…';

        picker = document.createElement('input');
        picker.setAttribute('type', 'file');
        picker.setAttribute('name', 'files[]');
        picker.setAttribute('id', 'picker');
        picker.setAttribute('multiple', 'multiple');
        picker.setAttribute('style', 'position:absolute;top:0;left:0;bottom:0;right:0;-webkit-opacity:0');
        div.appendChild(picker);
        break;
    case 'preview':
        if (!iconsView)
            iconsView = new icomatic.Views.IconCollectionView({ collection: this.model.get('icons') });
        div.appendChild(iconsView.render().el);
        button = document.createElement('button');
        button.setAttribute('id', 'button');
        button.innerText = 'Next';
        button.setAttribute('class', 'btn btn-large');
        div.appendChild(button);
        break;
    case 'export':
        var style = document.createElement('style');
        style.innerText = this.model.get('fontStyle').replace(this.model.get('fontPath'), '');
        document.querySelector('head').appendChild(style);
        var svg = document.createElement('div');
        svg.innerHTML = this.model.get('fontSVG');
        document.body.appendChild(svg);
        var p = document.createElement('p');
        p.setAttribute('class', this.model.get('fontClass'));
        p.setAttribute('style', 'font-size: 50px');
        p.innerText = this.model.get('icons').pluck('name').join(' ');
        div.appendChild(p);
        button = document.createElement('button');
        button.setAttribute('id', 'button');
        button.innerText = 'Download';
        button.setAttribute('class', 'btn');
        div.appendChild(button);
    }
    return this;
},
clickHandler: function(event) {
    switch(this.model.get('state')) {
        case 'preview':
            this.model.generateFont();
            break;
        case 'export':
            this.model.downloadFont();
            break;
    }
},
filesPicked: function(event) {
    var files = event.target.files,
        file, i, reader;
    if (files.length < 1)
        return;
    for (i = 0; i < files.length; i++) {
        file = files[i];
        if (file.type != 'image/svg+xml')
            continue;
        reader = new FileReader();
        reader.onload = (function(file, model) {
            return function(e) {
                var result = e.target.result;
                model.addIcon(file.name, result);
            };
        })(file, this.model);
        reader.readAsText(file);
    }     
    this.model.set('state', 'preview');
}
});
