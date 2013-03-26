icomatic.Models.ApplicationModel = Backbone.Model.extend({
defaults: {
    // upload, preview, or export
    state: 'upload',
    icons: null,
    // emSquare, ascent, descent
    emSquare: 1000,
    // font family, font id, font filename
    fontFamily: 'Icomatic',
    fontId: 'icomatic',
    fontPath: 'icomatic',
    //stylePath: 'styles.css',
    //fontClass: 'icomatic',
    fontSVG: null,
    fontStyle: null,
    fontScript: null,
    altClass: 'icomatic-alt'
},
initialize: function() {
    this.set('icons', new icomatic.Collections.IconCollection([]));
},
generateFont: function() {
    var glyphs = this.get('icons').map(function(iconModel) {
        var svg = document.createElement('div');
        svg.innerHTML = iconModel.get('svg');
        var path = svg.querySelector('path');
        var transform = $M([
            [1, 0, 1],
            [0, -1, this.get('emSquare')],
            [0, 0, 1]
        ]);
        var d = PathUtils.transformPath(path, transform).getAttribute('d');
        return {
            unicode: iconModel.get('name'),
            d: d
        };
    }, this);
    var fallbacks = [];
    //PUA: U+E000–U+F8FF
    var fallback = parseInt('0xe000');
    _.map(glyphs, function(glyph) {
        if (glyph.unicode.length > 1)
            fallbacks.push({
                unicode: '&#x' + fallback.toString(16),
                d: glyph.d,
                from: glyph.unicode
            });
    });
    var fontData = {
        fontFamily: this.get('fontFamily'),
        fontPath: this.get('fontPath'),
        fontId: this.get('fontId'),
        emSquare: this.get('emSquare'),
        glyphs: glyphs,
        fallbacks: fallbacks
    };
    var styleData = {
        fontClass: this.get('fontPath'),
        altClass: this.get('altClass')
    };
    var font = FontUtils.createFont(fontData);
    var stylesheet = FontUtils.createStylesheet(fontData, styleData);
    var script = FontUtils.createScript(fontData);
    this.set('fontSVG', font);
    this.set('fontStyle', stylesheet);
    this.set('fontScript', script);
},
downloadFont: function() {
    var zip = new JSZip();
    zip.file('index.html', this.samplePage());
    zip.file(this.get('fontPath') + '.css', this.get('fontStyle'));
    // var fontPath = this.get('fontPath').split('/');
    // var folder = zip;
    // for (var i = 0; i < fontPath.length - 1; i++)
    //     folder = folder.folder(fontPath[i]);
    // folder.file(fontPath[fontPath.length - 1], this.get('fontSVG'));
    zip.file(this.get('fontPath') + '.svg', this.get('fontSVG'));
    var content = zip.generate();
    location.href = 'data:application/zip;base64,' + content;
},
sampleTemplate: _.template(
"<html>\
<head>\
<link rel='stylesheet' type='text/css' href='<% print(fontPath + '.css') %>' />\
<link href='http://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700' rel='stylesheet' type='text/css'>\
<link href='http://fonts.googleapis.com/css?family=Source+Code+Pro' rel='stylesheet' type='text/css'>\
<style>\
body {\
  font-family: 'Source Sans Pro', Arial, sans-serif;\
  color: DimGray;\
}\
body code, body pre {\
    background-color: DimGray;\
    color: white;\
    font-family: 'Source Code Pro', monospace;\
}\
.demo {\
    border: 1px solid DimGray;\
    font-size: 1.5em;\
    line-height: 1.5;\
    font-family: '<%= fontFamily %>';\
}\
tr:nth-child(odd) { background-color: DimGray; color: white; }\
tr:nth-child(even) { background-color: white; color: DimGray; }\
</style>\
</head>\
<body>\
<h1>Ligature Icon Font</h1>\
Try typing one of your icon ligatures in the area below.\
eg <% icons.at(0).get('name') %>\
<div contenteditable class='<%= fontPath %> demo'></div>\
<h2>Icon Font Usage</h2>\
Using an icon font is simple. Just include the stylesheet, and the icon class to any text you would like to be replaced with an icon.\
<code><pre>\
&lt;link rel='stylesheet' type='text/css' href='<%= fontPath %>.css'&gt;<br/>\
...<br/>\
&lt;span class='<%= fontPath %>' style='color:blue'&gt;<%= icons.at(0).get('name') %>&lt;/span&gt;<br/>\
</pre></code>\
<h2>Available Icons</h2>\
<table>\
    <% icons.each(function(icon) { %><tr>\
        <td class='<%= fontPath %>'><%= icon.get('name') %></td>\
        <td><%= icon.get('name') %></td>\
    </tr><% }); %>\
</table>\
</body>\
</html>"
),
samplePage: function() {
    var result = this.sampleTemplate({
        fontPath: this.get('fontPath'),
        fontFamily: this.get('fontFamily'),
        icons: this.get('icons')
    });
    return result;
},
addIcon: function(fileName, svgContent) {
    fileName = fileName.replace(/\.\S+$/, '');
    svgContent = svgContent.replace(/^[\s\S]*(<svg)/i, "$1");
    var container = document.createElement('div');
    container.innerHTML = svgContent;
    var svg = container.querySelector('svg');
    var path = PathUtils.flattenPaths(svg);
    var emSquare = this.get('emSquare');
    path = PathUtils.projectPath(path, PathUtils.getBounds(svg), { x: 0, y: 0, width: emSquare, height: emSquare });

    // generate a new, clean svg
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + emSquare + ' ' + emSquare);
    var data = path.getAttribute('d');
    path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', data);
    path.setAttribute('fill', '#cecece');
    svg.appendChild(path);

    container.innerHTML = '';
    container.appendChild(svg);
    var iconModel = new icomatic.Models.IconModel({ name: fileName, svg: container.innerHTML });
    
    var icons = this.get('icons');
    if (!icons)
        this.set('icons', new icomatic.Collections.IconCollection(iconModel));
    else
        icons.push(iconModel);
}
});