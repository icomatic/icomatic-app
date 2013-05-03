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
    altClass: 'icomatic-alt',
    serverId: 'missing'
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
                unicode: '&#x' + (fallback++).toString(16) + ';',
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
    var script = FontUtils.createScript(fontData, styleData);
    this.set('fontSVG', font);
    this.set('fontStyle', stylesheet);
    this.set('fontScript', script);
},
loadLocalFile: function(fileName) {
    var request = new XMLHttpRequest();
    request.open('GET', fileName, false);
    request.send();
    if (request.status === 200)
        return request.responseText;
    else
        console.log('Failed to load file: ' + file.serverName);
    return '';
},
loadLocalFiles: function(files /*[{ serverName, destName }]*/) {
    var result = {};
    _.map(files, function(file) {
        var request = new XMLHttpRequest();
        request.open('GET', file.serverName, false);
        request.send();
        if (request.status === 200)
            result[file.destName] = request.responseText;
        else
            console.log('Failed to load file: ' + file.serverName);
    });
    return result;
},
generateFontPackage: function() {
    var result = this.loadLocalFiles([
        { serverName: 'sample/dat.gui.js', destName: 'js/dat.gui.js' },
        { serverName: 'sample/dat.color.js', destName: 'js/dat.color.js' }
        ]);
    result[this.get('fontPath') + '.css'] = this.get('fontStyle');
    result[this.get('fontPath') + '.js'] = this.get('fontScript');
    result[this.get('fontPath') + '.svg'] = this.get('fontSVG');
    result['index.html'] = this.samplePage();
    return result;
},
generateFontDataURI: function() {
    var result = this.generateFontPackage();
    var zip = new JSZip();
    var folders = {};
    var path, filename;
    for (var key in result) {
        path = key.split('/');
        filename = path.pop();
        path = path.join('/');
        if (path.length) {
            if (!folders.hasOwnProperty(path))
                folders[path] = zip.folder(path);
            folder = folders[path];
        }  else folder = zip;
        folder.file(filename, result[key]);
    }
    // zip.file(key, result[key]);
    // TODO: deal with folders
    var content = zip.generate();
    return 'data:application/zip;base64,' + content;
},
sampleTemplate: null,
samplePage: function() {
    var result;
    if (!this.sampleTemplate) {
        result = this.loadLocalFile('sample/sample-template.html');
        this.sampleTemplate = _.template(result);
    }
    result = this.sampleTemplate({
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
},
encode: function(data) {
    var result = [];
    for (var prop in data) {
        result.push(prop + '=' + encodeURIComponent(data[prop]));
    }
    return result.join('&');
},
prepareDownload: function() {
    var data = {
        'path': this.get('fontPath'),
        'style': this.get('fontStyle'),
        'font': this.get('fontSVG'),
        'script': this.get('fontScript'),
        'sample': this.samplePage()
    };
    var request = new XMLHttpRequest();
    var model = this;
    request.onload = function() {
        model.set('serverId', request.responseXML.querySelector('id').firstChild.nodeValue);
        model.set('state', 'purchase');
    }
    request.open('post', 'http://server.icomatic.io/icon-handler');
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send(this.encode(data));
}
});