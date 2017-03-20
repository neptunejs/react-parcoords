import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import parcoords from '../../d3.parcoords';
import {select as d3Select} from 'd3';
import _ from 'lodash';


class ParallelCoordinates extends Component {
    getAdaptiveAlpha(data) {
        if (data == undefined)
            return 1;
        var ratio = 100 / data.length
        return _.min([1, _.max([ratio, 0.04])])
    }

    onBrushEnd(data) {
        //data = _.map(data, function (d) { return ({ id: d.id, name: d.name }) })
        this.props.onBrushEnd_data(data);
        this.pc.alpha(this.getAdaptiveAlpha(data)).render();
        this.props.onBrushEnd_extents(this.pc.brushExtents());
        this.recalculateCentroids()
    }

    onBrush(data) {
        this.pc.alpha(this.getAdaptiveAlpha(data)).render();
        this.props.onBrush_extents(this.pc.brushExtents())
    }

    isOnLine(startPt, endPt, testPt, tol) { // from http://bl.ocks.org/mostaphaRoudsari/b4e090bb50146d88aec4
        // check if test point is close enough to a line
        // between startPt and endPt. close enough means smaller than tolerance
        var x0 = testPt[0];
        var y0 = testPt[1];
        var x1 = startPt[0];
        var y1 = startPt[1];
        var x2 = endPt[0];
        var y2 = endPt[1];
        var Dx = x2 - x1;
        var Dy = y2 - y1;
        var delta = Math.abs(Dy * x0 - Dx * y0 - x1 * y2 + x2 * y1) / Math.sqrt(Math.pow(Dx, 2) + Math.pow(Dy, 2));
        //console.log(delta);
        if (delta <= tol) return true;
        return false;
    }

    findAxes(testPt, cenPts) { // from http://bl.ocks.org/mostaphaRoudsari/b4e090bb50146d88aec4
        // finds between which two axis the mouse is
        var x = testPt[0];
        var y = testPt[1];

        // make sure it is inside the range of x
        if (cenPts[0][0] > x) return false;
        if (cenPts[cenPts.length - 1][0] < x) return false;

        // find between which segment the point is
        for (var i = 0; i < cenPts.length; i++) {
            if (cenPts[i][0] > x) return i;
        }
    }

    getLines(mousePosition) { // from http://bl.ocks.org/mostaphaRoudsari/b4e090bb50146d88aec4
        var clicked = [];
        var clickedCenPts = [];

        if (this.state.centroids.length == 0) return false;

        // find between which axes the point is
        var axeNum = this.findAxes(mousePosition, this.state.centroids[0]);
        if (!axeNum) return false;

        this.state.centroids.forEach(function (d, i) {
            if (this.isOnLine(d[axeNum - 1], d[axeNum], mousePosition, 2)) {
                clicked.push(this.state.activeData[i]);
                clickedCenPts.push(this.state.centroids[i]); // for tooltip
            }
        }.bind(this));

        return [clicked, clickedCenPts]
    }

    hoverLine(mousePosition) {
        // TODO get the hovered line's neuropil object identifier and return this; or just return full data here
        //console.log('mp', this.getLines(mousePosition));
        var linesAndPositions = this.getLines(mousePosition);
        var linesData = linesAndPositions[0];
        if (linesData === undefined) {
            this.props.onLineHover(undefined)
        } else {
            console.log('hoverLine', linesAndPositions);
            var firstLineData = linesData[0];
            this.props.onLineHover(firstLineData);
        }
    }

    recalculateCentroids() {
        // recalculate centroids
        var activeData = this.pc.brushed();
        var centroids = _.map(activeData, function (v) {
            return this.pc.compute_real_centroids(v)
        }.bind(this))
        this.setState({centroids: centroids, activeData: activeData})
    }

    componentDidMount() { // component is now in the DOM

        var self = this;
        var DOMNode = ReactDOM.findDOMNode(this);
        var data = self.props.data;
        var colour = self.props.colour;

        this.pc = parcoords({
            //alpha: 0.2,
            color: "#069",
            shadowColor: "#f3f3f3", // does not exist in current PC version
            width: this.props.width,
            height: this.props.height,
            dimensionTitleRotation: this.props.dimensionTitleRotation || -50,
            margin: {top: 33, right: 0, bottom: 12, left: 0},
            nullValueSeparator: "bottom",
        })(DOMNode);

        var ratio = 100 / data.length;

        this.pc = this.pc
            .data(data)
            .alpha(self.getAdaptiveAlpha(data))
            .composite("source-over") // globalCompositeOperation "darken" may be broken in chrome, "source-over" is boring
            .mode("queue")
            .dimensions(this.props.dimensions)
            .color(colour)
            // show/hide dimensions [0,1,2,3,4,5]
            .render()
            .shadows()
            .createAxes()
            //.reorderable()
            .brushMode("1D-axes") // enable brushing
            .on("brushend", function (d) {
                self.onBrushEnd(d)
            })
            .on("brush", function (d) {
                self.onBrush(d)
            })

        if (this.props.initialBrushExtents) {// set initial brushes
            this.pc.brushExtents(this.props.initialBrushExtents)
        }

        this.recalculateCentroids();

        //console.log('d3 mouse move to svg?');
        d3Select(DOMNode).select('svg')
            .on("mousemove", function () {
                var mousePosition = d3.mouse(this);
                mousePosition[1] = mousePosition[1] - 33; // this is margin top at the moment...
                self.hoverLine(mousePosition)
                //highlightLineOnClick(mousePosition, true); //true will also add tooltip
            })
            .on("mouseout", function () {
                self.props.onLineHover(undefined)
                //cleanTooltip();
                //graph.unhighlight();
            });

    }

    componentDidUpdate() { // update w/ new data http://blog.siftscience.com/blog/2015/4/6/d-threeact-how-sift-science-made-d3-react-besties

        var self = this

        // keep brush
        var brushExtents = this.pc.brushExtents()
        if (this.props.brushExtents !== undefined)
            brushExtents = this.props.brushExtents; // overwrite current brushExtents with props

        //console.log("updating for some reason, data=",this.props.data, "dimensions=", this.props.dimensions);
        var numDimensions = _.reduce(this.props.dimensions, function (sum, val) {
            return sum + 1
        }, 0)
        if (this.props.data === undefined || this.props.data[0] === undefined || numDimensions > this.props.data[0].length) {
            console.log("Not updating: not enough data for " + numDimensions + " dimensions.");
            return;
        }

        this.pc = this.pc
            .width(this.props.width)
            .height(this.props.height)
            .data(this.props.data) // set data again
            .alpha(self.getAdaptiveAlpha(this.props.data))
            .dimensions(this.props.dimensions)
            .color(this.props.colour)
            .autoscale();

        _.forEach(this.props.dimensions, function (value, key) {
            if (value.hasOwnProperty('domain')) {
                console.log("setting domain", value.domain, "for dimension", key);
                this.pc = this.pc.scale(key, value.domain)
            }
        }.bind(this))

        this.pc = this.pc
            .unhighlight([])
            .render()
            .shadows()
            .createAxes()
            //.reorderable()
            .brushMode("None") // enable brushing
            .brushMode("1D-axes") // enable brushing
            .brushExtents(brushExtents)
            .on("brushend", function (d) {
                self.onBrushEnd(d)
            })
            .on("brush", function (d) {
                self.onBrush(d)
            })


        if (this.props.dataHighlighted !== undefined && this.props.dataHighlighted.length > 0) {
            this.pc = this.pc.highlight(this.props.dataHighlighted)
        }

        this.recalculateCentroids();
    }

    /*,
     componentWillUnmount () { // clean up
     console.log('componentWillUnmount')
     },*/
    shouldComponentUpdate(nextProps, nextState) {
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
        var style = {
            width: this.props.width,
            height: this.props.height,
            position: 'relative'
        };
        //return (<div className={'parcoords'} style={style}></div>)
        return React.createElement('div', {className: 'parcoords', style: style});
    }
}

ParallelCoordinates.defaultProps = {
    state: {centroids: [], activeData: []}
};

ParallelCoordinates.propTypes = {
    dimensions: React.PropTypes.object.isRequired,
    data: React.PropTypes.array,
    dataHighlighted: React.PropTypes.array,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
};

export default ParallelCoordinates;
