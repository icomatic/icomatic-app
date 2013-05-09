var FontUtils = (function() {
var svgNS = 'http://www.w3.org/2000/svg';
return {
createScript: function(fontData, styleData) {
    var fallbackMap = _.map(fontData.fallbacks, function(value) { return "{ from: '" + value.from + "', 'to': '" + value.unicode + "' }" });
return "var IcomaticUtils = (function() {\n\
return {\n\
fallbacks: [" + fallbackMap.join(',') + "],\n\
substitute: function(el) {\n\
    var curr = el.firstChild;\n\
    var next, alt;\n\
    var content;\n\
    while (curr) {\n\
        next = curr.nextSibling;\n\
        if (curr.nodeType === Node.TEXT_NODE) {\n\
            content = curr.nodeValue;\n\
            for (var i = 0; i < IcomaticUtils.fallbacks.length; i++) {\n\
                content = content.replace( IcomaticUtils.fallbacks[i].from, function(match) {\n\
                    alt = document.createElement('span');\n\
                    alt.setAttribute('class', '" + styleData.altClass + "');\n\
                    alt.innerHTML = match;\n\
                    el.insertBefore(alt, curr);\n\
                    return IcomaticUtils.fallbacks[i].to;\n\
                });\n\
            }\n\
            alt = document.createTextNode(content);\n\
            el.replaceChild(alt, curr);\n\
        }\n\
        curr = next;\n\
    }\n\
},\n\
run: function(force) {\n\
    force = typeof force !== 'undefined' ? force : false;\n\
    var s = getComputedStyle(document.body);\n\
    if (s.hasOwnProperty('webkitFontFeatureSettings')\n\
        || s.hasOwnProperty('mozFontFeatureSettings')\n\
        || s.hasOwnProperty('msFontFeatureSettings')\n\
        || s.hasOwnProperty('oFontFeatureSettings')\n\
        || s.hasOwnProperty('fontFeatureSettings'))\n\
        if (!force)\n\
            return;\n\
    var els = document.querySelectorAll('." + styleData.fontClass + "');\n\
    for (var i = 0; i < els.length; i++)\n\
        IcomaticUtils.substitute(els[i]);\n\
}\n\
} // end of object\n\
} // end of fn\n\
)()";
},
createFont: function(fontData) { /* fontId, fontFamily, emSquare, glyphs: [{d, unicode}], fallbacks */
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('xmlns', svgNS);

    var defs = svg.appendChild(document.createElementNS(svgNS, 'defs'));

    var font = defs.appendChild(document.createElementNS(svgNS, 'font'));
    font.setAttribute('id', fontData.fontId)
    font.setAttribute('horiz-adv-x', fontData.emSquare);
    
    var fontFace = font.appendChild(document.createElementNS(svgNS, 'font-face'));
    fontFace.setAttribute('font-family', fontData.fontFamily)
    fontFace.setAttribute('units-per-em', fontData.emSquare)
    fontFace.setAttribute('ascent', fontData.emSquare * .8)
    fontFace.setAttribute('descent', fontData.emSquare * .2);
    
    var glyphs = fontData.glyphs.map(FontUtils.createGlyph);
    var fallbacks = fontData.fallbacks ? fontData.fallbacks.map(FontUtils.createGlyph) : [];
    glyphs = glyphs.concat(fallbacks);
    glyphs.reduce(function(font, glyph) { font.appendChild(glyph); return font; }, font);
    
    var elem = document.createElement('div');
    elem.appendChild(svg);
    return elem.innerHTML;
},
createGlyph: function(glyphData) {
    var glyph = document.createElementNS(svgNS, 'glyph');
    glyph.setAttribute('unicode', glyphData.unicode);
    glyph.setAttribute('d', glyphData.d);
    return glyph;
},
createStylesheet: function(fontData, styleData) {
    return '@font-face {\n\
    font-family: \'' + fontData.fontFamily + '\';\n\
    src: url(\'' + fontData.fontPath + '.eot\');\n\
    src: url(\'' + fontData.fontPath + '.eot?#iefix\') format("embedded-opentype"),\n\
         url(\'' + fontData.fontPath + '.woff\') format("woff"),\n\
         url(\'' + fontData.fontPath + '.ttf\') format("truetype"),\n\
         url(\'' + fontData.fontPath + '.svg#' + fontData.fontId + '\') format(\'svg\');\n\
    }\n\
    .' + styleData.fontClass + ' {\n\
    font-family: \'' + fontData.fontFamily + '\',\'sans-serif\';\n\
    line-height: 1;\n\
    text-rendering: optimizeLegibility;\n\
    -webkit-font-feature-settings: "liga", "dlig";\n\
    -ms-font-feature-settings: "liga", "dlig";\n\
    -moz-font-feature-settings: "liga", "dlig";\n\
    -o-font-feature-settings: "liga", "dlig";\n\
    font-feature-settings: "liga", "dlig";\n\
    -webkit-font-smoothing: antialiased;\n\
    }\n\
    .' + styleData.altClass + ' {\n\
    margin: -1px;\n\
    border:0;\n\
    padding: 0;\n\
    width: 1px; height: 1px;\n\
    clip: rect(0 0 0 0);\n\
    position: absolute;\n\
    overflow: hidden;\n\
    }';
}
} // end of object
} // end of fn
());