var FontUtils = (function() {
var svgNS = 'http://www.w3.org/2000/svg';
return {
createScript: function(fontData, styleData) {
    var fallbackMap = _.map(fontData.fallbacks, function(value) { return "{ from: '" + value.from + "', 'to': '" + value.unicode + "' }");
return "var IcomaticUtils = (function() {\
return {\
fallbacks: [" + fallbackMap.join(',') + "],\
substitute: function(el) {\
    var curr = el.firstChild;\
    var next, alt;\
    var content;\
    while (curr) {\
        next = curr.nextSibling;\
        if (curr.nodeType === Node.TEXT_NODE) {\
            content = curr.nodeValue;\
            for (var i = 0; i < fallbacks.length; i++) {\
                content.replace('\'' + fallbacks[i].from + '\'', function(match) {\
                    alt = document.createElement('span');\
                    alt.setAttribute('class', '" + styleData.altClass + "');\
                    el.insertBefore(curr, alt);\
                    return fallbacks[i].to;\
                });\
            }\
            alt = document.createTextNode(content);\
            el.replaceChild(curr, alt);\
        }\
        curr = next;\
    }\
},\
run: function() {\
    var els = document.querySelectorAll('.' + styleData.fontClass);\
    for (var i = 0; i < els.length; i++)\
        substitute(els[i]);\
}\
} // end of object\
} // end of fn\
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
    glyphs = fallbacks.splice(0, 0, glyphs);
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
    return '@font-face {\
    font-family: \'' + fontData.fontFamily + '\';\
    src: url(\'' + fontData.fontPath + '.svg#' + fontData.fontId + '\') format(\'svg\');\
    }\
    .' + styleData.fontClass + ' {\
    font-family: \'' + fontData.fontFamily + '\',\'sans-serif\';\
    line-height: 1;\
    text-rendering: optimizeLegibility;\
    -webkit-font-feature-settings: "liga" 1, "dlig" 1;\
    -webkit-font-smoothing: antialiased;\
    }\
    .' + fontData.altClass + ' {\
    -webkit-opacity: 0.5;\
    }';
}
} // end of object
} // end of fn
());