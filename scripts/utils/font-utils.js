var FontUtils = (function() {
var svgNS = 'http://www.w3.org/2000/svg';
return {
createFont: function(fontData) { /* fontId, fontFamily, emSquare, glyphs: [{d, unicode}] */
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
    src: url(\'' + fontData.fontPath + '#' + fontData.fontId + '\') format(\'svg\');\
    }\
    .' + styleData.fontClass + ' {\
    font-family: \'' + fontData.fontFamily + '\',\'sans-serif\';\
    line-height: 1;\
    text-rendering: optimizeLegibility;\
    -webkit-font-feature-settings: "liga" 1, "dlig" 1;\
    -webkit-font-smoothing: antialiased;\
    }';
}
} // end of object
} // end of fn
());