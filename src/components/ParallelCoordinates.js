import React, {Component} from 'react';
import parcoords from '../../d3.parcoords';
import d3 from 'd3';
import _ from 'lodash';

const TOP_MARGIN = 20;
class ParallelCoordinates extends Component {
    constructor(props) {
        super(props);
        this.lastHoveredLine = null;
    }

    set activeData(val) {
        this._activeData = val;
        this.activeCentroids = this._activeData.map(this.pc.compute_real_centroids);
    }

    get activeData() {
        return this._activeData;
    }

    resetBrush() {
        this.pc.brushReset();
        this.activeData = this.props.data;
    }

    getAdaptiveAlpha(data) {
        if (data === undefined) {
            return 1;
        }
        const ratio = 100 / data.length;
        return Math.min(1, Math.max(ratio, 0.04));
    }

    onBrushEnd(data) {
        this.isBrushing = false;
        this.activeData = data;
        this.pc.alpha(this.getAdaptiveAlpha(data)).render();
        this.props.onBrushEnd({
            data: data,
            extents: this.pc.brushExtents()
        });
    }

    onBrush(data) {
        this.isBrushing = true;
        this.pc.alpha(this.getAdaptiveAlpha(data)).render();
        this.props.onBrush({
            data,
            extents: this.pc.brushExtents()
        });
    }

    isOverLine(startPt, endPt, testPt, tol) { // from http://bl.ocks.org/mostaphaRoudsari/b4e090bb50146d88aec4
        // check if test point is close enough to a line
        // between startPt and endPt. close enough means smaller than tolerance
        const x0 = testPt[0];
        const y0 = testPt[1];
        const x1 = startPt[0];
        const y1 = startPt[1];
        const x2 = endPt[0];
        const y2 = endPt[1];
        const Dx = x2 - x1;
        const Dy = y2 - y1;
        const delta = Math.abs(Dy * x0 - Dx * y0 - x1 * y2 + x2 * y1) / Math.sqrt(Math.pow(Dx, 2) + Math.pow(Dy, 2));
        return delta <= tol;
    }

    findAxeIdx(testPt, cenPts) { // from http://bl.ocks.org/mostaphaRoudsari/b4e090bb50146d88aec4
        // finds between which two axis the mouse is
        const x = testPt[0];
        // var y = testPt[1];

        // make sure it is inside the range of x
        if (cenPts[0][0] > x) return -1;
        if (cenPts[cenPts.length - 1][0] < x) return -1;

        // find between which segment the point is
        for (let i = 0; i < cenPts.length; i++) {
            if (cenPts[i][0] > x) return i;
        }
        return -1;
    }

    getLines(mousePosition) { // from http://bl.ocks.org/mostaphaRoudsari/b4e090bb50146d88aec4
        const data = [];
        const centroids = [];

        if (this.activeCentroids.length === 0) return null;

        // find between which axes the point is
        const axeNum = this.findAxeIdx(mousePosition, this.activeCentroids[0]);
        if (axeNum < 0) return null;

        this.activeCentroids.forEach(function (d, i) {
            if (this.isOverLine(d[axeNum - 1], d[axeNum], mousePosition, 2)) {
                data.push(this.activeData[i]);
                centroids.push(this.activeCentroids[i]); // for tooltip
            }
        }.bind(this));

        return {
            data, centroids
        };
    }

    hoverLine(mousePosition) {
        if (this.isBrushing) return;
        const lines = this.getLines(mousePosition);
        if (lines === null) {
            this.lastHoveredLine = null;
            return;
        }
        if (this.lastHoveredLine !== lines.data[0]) {
            this.lastHoveredLine = lines.data[0];
            this.props.onLineHover(this.lastHoveredLine);
            this.props.onLinesHover(lines.data);
        }
    }

    checkPropsSanity() {
        const numDimensions = Object.keys(this.props.dimensions).length;
        if (this.props.data === undefined || this.props.data[0] === undefined || numDimensions > this.props.data[0].length) {
            throw new Error('Data and dimension mismatch');
        }
    }

    componentDidMount() { // component is now in the DOM
        const DOMNode = this.refs.parcoords;

        this.createPC();

        const that = this;
        d3.select(DOMNode).select('svg')
            .on('mousemove', function () {
                const mousePosition = d3.mouse(this);
                mousePosition[1] = mousePosition[1] - TOP_MARGIN; // this is margin top at the moment...
                that.hoverLine(mousePosition);
                //highlightLineOnClick(mousePosition, true); //true will also add tooltip
            });
    }

    createPC() {
        this.pc = parcoords({
            alpha: 0.2,
            margin: {top: TOP_MARGIN, right: 0, bottom: 12, left: 0},
        })(this.refs.parcoords);

        this.updatePC();
        this.pc
            .on('brushend', d => {
                this.onBrushEnd(d);
            })
            .on('brush', d => {
                this.onBrush(d);
            });
    }

    updatePC() {
        const dimensions = _.cloneDeep(this.props.dimensions);
        this.checkPropsSanity();
        this.refs.parcoords.style.width = this.props.width;
        this.refs.parcoords.style.height = this.props.height;

        this.pc
            .width(this.props.width)
            .height(this.props.height)
            .data(this.props.data)
            .alpha(this.getAdaptiveAlpha(this.props.data))
            .dimensions(dimensions)
            .color(this.props.color)
            .mode('queue')
            .composite('darken')
            .shadows()
            .createAxes()
            .reorderable()
            .brushMode('None')
            .brushMode('1D-axes');

        this.resetActiveData();
        this.pc.render();
        this.setHighlights();

    }

    resetActiveData() {
        if (this.props.brushExtents) {

            this.pc.brushExtents(this.props.brushExtents);
            this.activeData = this.pc.brushed();
        } else {
            this.resetBrush();
        }
    }

    setHighlights() {
        if (this.props.highlights && this.props.highlights.length) {
            this.pc.highlight(this.props.highlights);
        } else {
            this.pc.unhighlight();
        }
    }


    componentDidUpdate() { // update w/ new data http://blog.siftscience.com/blog/2015/4/6/d-threeact-how-sift-science-made-d3-react-besties
        // keep brush
        this.updatePC();
    }

    shouldComponentUpdate(nextProps) {
        return ['data', 'dimensions', 'color', 'filter', 'highlights', 'width', 'height'].some(prop => {
            return this.props[prop] !== nextProps[prop];
        });
    }

    render() {
        const style = {
            width: this.props.width,
            height: this.props.height,
        };
        return (
            <div ref="parcoords" className="parcoords" style={style}></div>
        );
    }
}

function noop() {
    // noop
}

ParallelCoordinates.defaultProps = {
    onLineHover: noop,
    onLinesHover: noop,
    onBrush: noop,
    onBrushEnd: noop
};

ParallelCoordinates.propTypes = {
    dimensions: React.PropTypes.object.isRequired,
    data: React.PropTypes.array,
    highlights: React.PropTypes.array,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
};

export default ParallelCoordinates;
