import React, {Component} from 'react';
import parcoords from '../../d3.parcoords';
import {select as d3Select} from 'd3';
import _ from 'lodash';


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

        if (this.activeCentroids.length == 0) return null;

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
        }
    }

    hoverLine(mousePosition) {
        if(this.isBrushing) return;
        const lines = this.getLines(mousePosition);
        if(lines === null) {
            this.lastHoveredLine = null;
            return;
        }
        if(this.lastHoveredLine !== lines.data[0]) {
            this.lastHoveredLine = lines.data[0];
            this.props.onLineHover(this.lastHoveredLine);
            this.props.onLinesHover(lines.data);
        }
    }

    componentDidMount() { // component is now in the DOM
        console.log('component did mount');
        const DOMNode = this.refs.parcoords;
        const data = this.props.data;
        const colour = this.props.colour;

        this.pc = parcoords({
            //alpha: 0.2,
            color: "#069",
            shadowColor: "#f3f3f3", // does not exist in current PC version
            dimensionTitleRotation: -50,
            margin: {top: 33, right: 0, bottom: 12, left: 0},
            nullValueSeparator: "bottom",
        })(DOMNode);

        this.updatePC();


        const that = this;
        d3Select(DOMNode).select('svg')
            .on("mousemove", function()  {
                const mousePosition = d3.mouse(this);
                mousePosition[1] = mousePosition[1] - 33; // this is margin top at the moment...
                that.hoverLine(mousePosition);
                //highlightLineOnClick(mousePosition, true); //true will also add tooltip
            });
    }

    updatePC() {
        this.pc
            .data(this.props.data)
            .alpha(this.getAdaptiveAlpha(this.props.data))
            .composite("source-over") // globalCompositeOperation "darken" may be broken in chrome, "source-over" is boring
            .mode("queue")
            .dimensions(this.props.dimensions)
            .color(this.props.color)
            // show/hide dimensions [0,1,2,3,4,5]
            .render()
            .shadows()
            .createAxes()
            .reorderable()
            .brushMode("1D-axes") // enable brushing
            .on("brushend", d => {
                this.onBrushEnd(d)
            })
            .on("brush", d => {
                this.onBrush(d);
            });

        if (this.props.brushExtents) {
            this.pc.brushExtents(this.props.brushExtents);
            this.activeData = this.pc.brushed();
        } else {
            this.resetBrush();
        }

    }

    componentDidUpdate() { // update w/ new data http://blog.siftscience.com/blog/2015/4/6/d-threeact-how-sift-science-made-d3-react-besties
        // keep brush
        console.log('component did update');
        let brushExtents = this.pc.brushExtents();
        if (this.props.brushExtents !== undefined)
            brushExtents = this.props.brushExtents; // overwrite current brushExtents with props

        const numDimensions = this.props.dimensions.reduce(sum => sum + 1, 0);
        if (this.props.data === undefined || this.props.data[0] === undefined || numDimensions > this.props.data[0].length) {
            console.log("Not updating: not enough data for " + numDimensions + " dimensions.");
            return;
        }

        this.pc = this.pc
            .width(this.props.width)
            .height(this.props.height)
            .data(this.props.data) // set data again
            .alpha(this.getAdaptiveAlpha(this.props.data))
            .dimensions(this.props.dimensions)
            .color(this.props.color)
            .autoscale();

        _.forEach(this.props.dimensions, function (value, key) {
            if (value.hasOwnProperty('domain')) {
                this.pc = this.pc.scale(key, value.domain)
            }
        }.bind(this));

        this.pc = this.pc
            .unhighlight([])
            .render()
            .shadows()
            .createAxes()
            //.reorderable()
            .brushMode("None") // enable brushing
            .brushMode("1D-axes") // enable brushing
            .brushExtents(brushExtents)
            .on("brushend", d => {
                this.onBrushEnd(d)
            })
            .on("brush", d => {
                this.onBrush(d)
            });

        if (this.props.dataHighlighted !== undefined && this.props.dataHighlighted.length > 0) {
            this.pc = this.pc.highlight(this.props.dataHighlighted)
        }
    }

    /*,
     componentWillUnmount () { // clean up
     },*/
    shouldComponentUpdate(nextProps) {
        return (
            JSON.stringify(_.map(nextProps.dimensions, function (v, k) {
                return v.title
            }.bind(this))) !==
            JSON.stringify(_.map(this.props.dimensions, function (v, k) {
                return v.title
            }.bind(this))) || // update if dimensions changed
            JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data) || // update if data changed
            JSON.stringify(nextProps.dataHighlighted) !== JSON.stringify(this.props.dataHighlighted) || // update if dataHighlighted changed
            (nextProps.width != this.props.width) ||
            (nextProps.height != this.props.height)
        )
    }

    render() {
        const style = {
            width: this.props.width,
            height: this.props.height,
            position: 'relative'
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
    dataHighlighted: React.PropTypes.array,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
};

export default ParallelCoordinates;
