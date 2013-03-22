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
template: _.template(
"<div class='row-fluid' style='margin-top:2em'>\
  <div class='span3'>\
    <ol id='steplist' class='nav nav-list'>\
        <li class='<% print(state === 'upload' ? 'active' : '') %>'>1. Upload Your Vector Icons</li>\
        <li class='<% print(state === 'preview' ? 'active' : '') %>'>2. Preview Icons</li>\
        <li class='<% print(state === 'export' ? 'active' : '') %>'>3. Download Your Icon Font</li>\
        <li class='<% print(state === 'purchase' ? 'active' : '') %>'>4. Purchase It</li>\
    </ol>\
  </div>\
  <div class=\'span9\'>\
  </div>\
</div>"
),
uploadTemplate: _.template(
"<div style='position:relative' class='btn btn-large'>\
  Upload Files...\
  <input type='file' name='files[]' id='picker' multiple style='position:absolute;top:0;left:0;right:0;bottom:0;-webkit-opacity:0;-moz-opacity:0;opacity:0>\
</div>"
),
exportTemplate: _.template(
"<p class='<%= fontPath %>' style='font-size: 50px'>\
  <% icons.each(function(icon) { %> <%= icon.get('name') %> <% }); %>\
</p>\
<button id='button' class='btn'>Download</button>\
<form id='form' enctype='application/x-www-form-urlencoded' action='http://server.icomatic.io/icon-handler' method='post'>\
  <% _.forEach(inputs, function(input) { %><input type='hidden' name='<%=input.name%>' value='<%-input.value%>'><% });%>\
</form>"
),
previewTemplate: _.template("<button id='button' class='btn btn-large'>Next</button>"),
purchaseTemplate: _.template(
"<h2>Thanks for trying us out!</h2>\
<p>Feel free to try out the test SVG font. For our beta testers interested in a full font kit\
(with .eot, .woff, and .ttf formats), you can use the PayPal link below and then send your\
SVG font in to us at icomaticsf[at]gmail.com.</p><br/>\
<form action='https://www.paypal.com/cgi-bin/webscr' method='post' target='_top'>\
    <input type='hidden' name='cmd' value='_s-xclick'>\
    <input type='hidden' name='hosted_button_id' value='P2VQH6ZJQ3KSU'>\
    <input type='image' src='https://www.paypalobjects.com/en_US/i/btn/btn_buynowCC_LG.gif' border='0' name='submit' alt='PayPal - The safer, easier way to pay online!'>\
    <img alt='' border='0' src='https://www.paypalobjects.com/en_US/i/scr/pixel.gif' width='1' height='1'>\
</form>"
),
render: function() {
    this.el.innerHTML = this.template({ state: this.model.get('state') });
    var result, iconsView,
    div = this.el.querySelector('.span9');
    switch(this.model.get('state')) {
    case 'upload':
        result = this.uploadTemplate({});
        div.innerHTML = result;
        break;
    case 'preview':
        result = this.previewTemplate({});
        div.innerHTML = result;
        iconsView = new icomatic.Views.IconCollectionView({ collection: this.model.get('icons') });
        div.insertBefore(iconsView.render().el, div.firstChild);
        break;
    case 'export':
        var style = document.createElement('style');
        style.innerText = this.model.get('fontStyle').replace(this.model.get('fontPath') + '.svg', '');
        document.querySelector('head').appendChild(style);
        var svg = document.createElement('div');
        svg.innerHTML = this.model.get('fontSVG');
        document.body.appendChild(svg);
        var inputs = [
            { name: 'name', value: this.model.get('fontFamily') },
            { name: 'path', value: this.model.get('fontPath') },
            { name: 'fontData', value: this.model.get('fontSVG') },
            { name: 'styleData', value: this.model.get('fontStyle') },
            { name: 'sampleData', value: this.model.samplePage() }
            ];
        result = this.exportTemplate({
            fontPath: this.model.get('fontPath'),
            icons: this.model.get('icons'),
            inputs: inputs
        });
        div.innerHTML= result;
        break;
    case 'purchase':
        result = this.purchaseTemplate({});
        div.innerHTML = result;
        break;
    }
    return this;
},
createForm: function(values /*[{ name, value }]*/) {
    var form = document.createElement('form');
    form.setAttribute('id', 'form');
    form.setAttribute('enctype', 'application/x-ww-form-urlencoded');
    form.setAttribute('action', 'http://server.icomatic.io/icon-handler');
    form.setAttribute('method', 'post');
    values.map(function(value) {
        var input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', value.name);
        input.setAttribute('value', value.value);
        form.appendChild(input);
    });
    return form;
},
clickHandler: function(event) {
    switch(this.model.get('state')) {
        case 'preview':
            this.model.generateFont();
            this.model.set('state', 'export');
            break;
        case 'export':
            var form = document.getElementById('form');
            form.submit();
            this.model.set('state', 'purchase');
            //this.model.downloadFont();
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
