// requires Sylvester
var PathUtils = (function() {
return {
mapPath: function(fn, path, context) {
    var segments = path.pathSegList,
        length = segments.numberOfItems,
        i, segment;
    for (i = 0; i < length; i++) {
        segment = segments.getItem(i);
        segment = fn.apply(context, [segment, i]);
        if (segment !== segments.getItem(i))
            segments.replaceItem(segment, i);
    }
    return path;
},
reducePath: function(fn, result, path, context) {
    var segments = path.pathSegList,
        length = segments.numberOfItems,
        i, segment;
    for (i = 0; i < length; i++) {
        segment = segments.getItem(i);
        result = fn.apply(context, [result, segment, i]);
    }
    return result;
},
flattenPaths: function(svg) {
    var sourcePaths = svg.querySelectorAll('path');
    var resultPath, currPath;
    // These need to be converted into the root coordinate system
    for (var i = 0; i < sourcePaths.length; i++) {
        currPath = PathUtils.toAbsolutePath(sourcePaths.item(i).cloneNode(true));
        if (i == 0)
            resultPath = currPath;
        else {
            resultPath = PathUtils.splicePaths(resultPath, currPath);
        }
    }
    return resultPath;
},
splicePaths: function(pathDest, pathSrc) {
    result = PathUtils.reducePath(function(result, segment, i) {
        result.pathSegList.appendItem(PathUtils.cloneSegment(pathSrc, segment));
        return result;
    }, pathDest, pathSrc);
    return result;
},
getBounds: function(svg) {
    var viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
        viewBox = viewBox.split(/\s+/);
        return { x: viewBox[0], y: viewBox[1], width: viewBox[2], height: viewBox[3] };
    }
    if (svg.getAttribute('width') && svg.getAttribute('height'))
        return { x: 0, y: 0, width: svg.getAttribute('width'), height: svg.getAttribute('height') };
    var path = svg.querySelector('path');
    return path.getBBox();
},
projectPath: function(path, boundsFrom, boundsTo) {
    // translate the origin to 0,0
    var transform = $M([
        [1, 0, -boundsFrom.x],
        [0, 1, -boundsFrom.y],
        [0, 0, 1]]);
    // scale uniformly, such that the resulting bounds fit within the new bounds
    var scale = Math.min(boundsTo.width, boundsTo.height) / Math.max(boundsFrom.width, boundsFrom.height);
    transform = $M([
        [scale, 0, 0],
        [0, scale, 0],
        [0, 0, 1]
    ]).x(transform);
    // translate to the new origin
    transform = $M([
        [1, 0, boundsTo.x],
        [0, 1, boundsTo.y],
        [0, 0, 1]
    ]).x(transform);
    return PathUtils.transformPath(path, transform);
},
cloneSegment: function(path, segment) {
    var properties = PathUtils.getProperties(segment.pathSegType);
    var args = properties.properties.map(function(prop) {
        return this[prop];
    }, segment);
    return properties.cloneFn.apply(path, args);
},
toAbsoluteSegment: function(path, segment, x, y) {
    if (!PathUtils.isRelative(segment.pathSegType))
        return segment;
    var properties = PathUtils.getProperties(PathUtils.toAbsolute(segment.pathSegType));
    var args = properties.properties.map(function(prop) {
        var result = this.segment[prop];
        if (this.xProperties.indexOf(prop) >= 0)
            result += this.x;
        else if (this.yProperties.indexOf(prop) >= 0)
            result += this.y;
        return result;
    }, {
        segment: segment,
        xProperties: properties.xProperties,
        yProperties: properties.yProperties,
        x: x,
        y: y
    });
    return properties.cloneFn.apply(path, args);
},
toAbsolutePath: function(path) {
    return PathUtils.mapPath(function(segment, i) {
        absSegment = PathUtils.toAbsoluteSegment(this.path, segment, this.x, this.y);
        if (absSegment.hasOwnProperty('x'))
            this.x = absSegment.x;
        if (absSegment.hasOwnProperty('y'))
            this.y = absSegment.y;
        return absSegment;
    }, path, { x: 0, y: 0, path: path });
},
transformPath: function(path, transform) {
    return PathUtils.mapPath(function(segment, i) {
        var properties = PathUtils.getProperties(segment.pathSegType),
            propertiesLength = Math.max(properties.xProperties.length, properties.yProperties.length),
            j, v;
        for (j = 0; j < propertiesLength; j++) {
            // Use pairs of x/y coords while we can
            v = $V([
                (j < properties.xProperties.length ? segment[properties.xProperties[j]] : 0),
                (j < properties.yProperties.length ? segment[properties.yProperties[j]] : 0),
                1
                ]);
            v = this.transform.x(v);
            // Sylvester begins indexing at 1, not 0
            if (j < properties.xProperties.length)
                segment[properties.xProperties[j]] = v.e(1);
            if (j < properties.yProperties.length)
                segment[properties.yProperties[j]] = v.e(2);
        }
        return segment;
    }, path, { transform: transform });
},
isRelative: function(pathSegType) {
    return (pathSegType > 1 && pathSegType % 2 === 1);
},
toAbsolute: function(pathSegType) {
    if (PathUtils.isRelative(pathSegType))
        return pathSegType - 1;
    return pathSegType;
},
getProperties: function(pathSegType) {
    var properties, xProperties, yProperties, cloneFn;
    switch(pathSegType) {
        case SVGPathSeg.PATHSEG_UNKNOWN:
            break;
        case SVGPathSeg.PATHSEG_CLOSEPATH:
            cloneFn = SVGPathElement.prototype.createSVGPathSegClosePath;
            properties = xProperties = yProperties = [];
            break;
        case SVGPathSeg.PATHSEG_MOVETO_ABS:
        case SVGPathSeg.PATHSEG_MOVETO_REL:
            cloneFn = (pathSegType === SVGPathSeg.PATHSEG_MOVETO_ABS) ? 
                SVGPathElement.prototype.createSVGPathSegMovetoAbs :
                SVGPathElement.prototype.createSVGPathSegMovetoRel;
            properties = ['x', 'y'];
            xProperties = ['x'];
            yProperties = ['y'];
            break;
        case SVGPathSeg.PATHSEG_LINETO_ABS:
        case SVGPathSeg.PATHSEG_LINETO_REL:
            cloneFn = (pathSegType === SVGPathSeg.PATHSEG_LINETO_ABS) ?
                SVGPathElement.prototype.createSVGPathSegLinetoAbs :
                SVGPathElement.prototype.createSVGPathSegLinetoRel;
            properties = ['x', 'y'];
            xProperties = ['x'];
            yProperties = ['y'];
            break;
        case SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS:
        case SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL:
            cloneFn = (pathSegType === SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS) ? 
                SVGPathElement.prototype.createSVGPathSegCurvetoCubicAbs :
                SVGPathElement.prototype.createSVGPathSegCurvetoCubicRel;
            properties = [ 'x', 'y', 'x1', 'y1', 'x2', 'y2' ];
            xProperties = [ 'x', 'x1', 'x2' ];
            yProperties = [ 'y', 'y1', 'y2' ];
            break;
        case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS:
        case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL:
            cloneFn = (pathSegType === SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS) ?
                SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticAbs :
                SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticRel;
            properties = [ 'x', 'y', 'x1', 'y1' ];
            xProperties = [ 'x', 'x1' ];
            yProperties = [ 'y', 'y1' ];
            break;
        case SVGPathSeg.PATHSEG_ARC_ABS:
        case SVGPathSeg.PATHSEG_ARC_REL:
            cloneFn = (pathSegType === SVGPathSeg.PATHSEG_ARC_ABS) ?
                SVGPathElement.prototype.createSVGPathSegArcAbs :
                SVGPathElement.prototype.createSVGPathSegArcRel;
            properties = [ 'x', 'y', 'r1', 'r2', 'angle', 'largeArcFlag', 'sweepFlag' ];
            xProperties = [ 'x', 'r1' ];
            yProperties = [ 'y', 'r2' ];
            break;
        case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS:
        case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL:
            cloneFn = (pathSegType === SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS) ?
                SVGPathElement.prototype.createSVGPathSegLinetoHorizontalAbs :
                SVGPathElement.prototype.createSVGPathSegLinetoHorizontalRel;
            properties = [ 'x' ];
            xProperties = [ 'x' ];
            yProperties = [];
            break;
        case SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS:
        case SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL:
            cloneFn = (pathSegType === SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS) ?
                SVGPathElement.prototype.createSVGPathSegLinetoVerticalAbs :
                SVGPathElement.prototype.createSVGPathSegLinetoVerticalRel;
            properties = [ 'y' ];
            xProperties = [];
            yProperties = [ 'y' ];
            break;
        case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS:
        case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL:
            cloneFn = (pathSegType === SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS) ?
                SVGPathElement.prototype.createSVGPathSegCurvetoCubicSmoothAbs :
                SVGPathElement.prototype.createSVGPathSegCurvetoCubicSmoothRel;
            properties = [ 'x', 'y', 'x2', 'y2' ];
            xProperties = [ 'x', 'x2' ];
            yProperties = [ 'y', 'y2' ];
            break;
        case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS:
        case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL:
            cloneFn = (pathSegType === SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS) ?
                SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticSmoothAbs :
                SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticSmoothRel;
            properties = [ 'x', 'y' ];
            xProperties = [ 'x' ];
            yProperties = [ 'y' ];
            break;
    };
    return {
        cloneFn: cloneFn,
        properties: properties,
        xProperties: xProperties,
        yProperties: yProperties
    };
}
}
}());
