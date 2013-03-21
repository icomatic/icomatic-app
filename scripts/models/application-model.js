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
    fontStyle: null
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
    var fontData = {
        fontFamily: this.get('fontFamily'),
        fontPath: this.get('fontPath'),
        fontId: this.get('fontId'),
        emSquare: this.get('emSquare'),
        glyphs: glyphs
    };
    var styleData = {
        fontClass: this.get('fontPath')
    };
    var font = FontUtils.createFont(fontData);
    var stylesheet = FontUtils.createStylesheet(fontData, styleData);
    this.set('fontSVG', font);
    this.set('fontStyle', stylesheet);
    this.set('state', 'export');
},
downloadFont: function() {
    var zip = new JSZip();
    zip.file('index.html', this.samplePage());
    zip.file(this.get('stylePath'), this.get('fontStyle'));
    var fontPath = this.get('fontPath').split('/');
    var folder = zip;
    for (var i = 0; i < fontPath.length - 1; i++)
        folder = folder.folder(fontPath[i]);
    folder.file(fontPath[fontPath.length - 1], this.get('fontSVG'));
    var content = zip.generate();
    location.href = 'data:application/zip;base64,' + content;
},
samplePage: function() {
    var html = [];
    html.push('<html>');
    html.push('<head>');
    html.push('<link rel=\'stylesheet\' type=\'text/css\' href=\'' + this.get('fontPath') + '.css' + '\'/>');
    html.push("<link href='http://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700' rel='stylesheet' type='text/css'>");
    html.push("<link href='http://fonts.googleapis.com/css?family=Source+Code+Pro' rel='stylesheet' type='text/css'>");
    html.push('<style>');
    html.push('body {');
    html.push('    font-family: "Source Sans Pro", Arial, sans-serif;');
    html.push('    color: DimGray;')
    html.push('}');
    html.push('body code, body pre {');
    html.push('    background-color: DimGray;');
    html.push('    color: white;');
    html.push('    font-family: "Source Code Pro", monospace;');
    html.push('}');
    html.push('.demo {');
    html.push('    border: 1px solid DimGray;');
    html.push('    font-size: 1.5em;');
    html.push('    line-height: 1.5;');
    html.push('    font-family: ' + this.get('fontFamily') + ';');
    html.push('}');
    html.push('tr:nth-child(odd) { background-color: DimGray; color: white;');
    html.push('tr:nth-child(even) { background-color: white; color: DimGray;');
    html.push('</style>');
    html.push('</head>');
    html.push('<body>');
    html.push('<h1>Ligature Icon Font</h1>');
    html.push('Try typing one of your icon ligatures in the area below.');
    html.push('eg "' + this.get('icons').at(0).get('name') + '"');
    html.push('<div contenteditable class=\'' + this.get('fontPath') + ' demo\'></div>');
    html.push('<h2>Icon Font Usage</h2>');
    html.push('Using an icon font is simple. Just include the stylesheet, and add the icon class to any text you would like to be replaced with an icon.');
    html.push('<code><pre>');
    html.push('&lt;link rel=\'stylesheet\' type=\'text/css\' href=\'' + this.get('fontPath') + '.css' + '\'/&gt;');
    html.push('...');
    html.push('&lt;span class=\'' + this.get('fontPath') + '\' style=\'color:blue\'&gt;' + this.get('icons').at(0).get('name') + '&lt;/span&gt;');
    html.push('</pre></code>');
    html.push('<h2>Available Icons</h2>');
    var thumbnails = this.get('icons').map(function(iconModel) {
        var thumbnail = [];
        thumbnail.push('<tr>');
        thumbnail.push('<td class=\'' + this.get('fontPath') + '\'>');
        thumbnail.push(iconModel.get('name'));
        thumbnail.push('</td>');
        thumbnail.push('<td>');
        thumbnail.push(iconModel.get('name'));
        thumbnail.push('</td>');
        thumbnail.push('</tr>');
        return thumbnail.join('\n');
    }, this);
    thumbnails = thumbnails.join('\n');
    html.push('<table>');
    html.push(thumbnails);
    html.push('</table>');
    html.push('</body>');
    html.push('</html>');
    return html.join('\n');
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