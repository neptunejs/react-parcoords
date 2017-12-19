import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import data from './data';
import '../../d3.parcoords.css';

import {ParallelCoordinates} from '../../src';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            color: 'red',
            width: 1200,
            height: 300,
            dummy: false,
            dimensions: data.dimensions,
            data: data.data,
            highlights: [],
            highlightIdx: 0
        };
    }
    switchColor() {
        this.setState({
            color: this.state.color === 'red' ? 'blue' : 'red'
        });
    }

    switchSize() {
        this.setState({
            width: this.state.width === 1200 ? 600 : 1200,
            height: this.state.height === 300 ? 600 : 300
        });
    }

    switchDimensions() {
        const cpy = {};
        Object.keys(this.state.dimensions).reverse().forEach(k => {
            cpy[k] = this.state.dimensions[k];
        });
        this.setState({
            dimensions: cpy
        });
    }

    switchDimensionPresence() {
        if(this.state.dimensions) {
            this.setState({
                dimensions: null
            });
        } else {
            this.setState({
                dimensions: data.dimensions
            });
        }
    }

    switchData() {
        const data = this.state.data.map(d => {
            const newData = {};
            Object.keys(d).forEach(k => {
                newData[k] = d[k] + 1;
            });
            return newData;
        });
        this.setState({
            data
        });
    }

    switchDummy() {
        this.setState({
            dummy: !this.state.dummy
        });
    }

    switchDataPresence() {
        if(this.state.data.length !== 0) {
            this.setState({data: []})
        } else {
            this.setState({
                data: data.data
            });
        }
    }

    switchHighlights() {
        let idx = (this.state.highlightIdx + 1) % (this.state.data.length + 1);
        console.log(idx);
        this.setState({
            highlightIdx: idx,
            highlights: idx === 0 ? [] : [this.state.data[idx - 1]]
        });
    }

    render() {
        return (
            <div>
                <ParallelCoordinates
                    width={this.state.width}
                    height={this.state.height}
                    dimensions={this.state.dimensions}
                    data={this.state.data}
                    color={this.state.color}
                    highlights={this.state.highlights}
                    onBrush={noop}
                    onBrushEnd={d => console.log('brush end', d)}
                    onLineHover={d => console.log('line hover', d)}
                    onLinesHover={lines => console.log('lines hover', lines)}
                />
                <input type="button" onClick={this.switchColor.bind(this)} value="Change color" />&nbsp;
                <input type="button" onClick={this.switchSize.bind(this)} value="Change size" />&nbsp;
                <input type="button" onClick={this.switchDimensions.bind(this)} value="Switch dimensions" />&nbsp;
                <input type="button" onClick={this.switchData.bind(this)} value="Change data" />&nbsp;
                <input type="button" onClick={this.switchDummy.bind(this)} value="Change dummy" />&nbsp;
                <br /><br />
                <input type="button" onClick={this.switchHighlights.bind(this)} value="Switch highlights" />&nbsp;
                <input type="button" onClick={this.switchDataPresence.bind(this)} value="Switch data presence" />&nbsp;
                <input type="button" onClick={this.switchDimensionPresence.bind(this)} value="Switch dimension presence" />&nbsp;
            </div>
        );
    }
}

function noop() {}

ReactDOM.render(
    <App />,
    document.getElementById('example')
);
