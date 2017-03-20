import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import data from './data';

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
            highlighted: 0
        }
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

    switchHighlighted() {
        this.setState({
            highlighted: (this.state.highlighted + 1) % this.state.data.length
        });
    }

    render() {
        const highlighted = [this.state.data[this.state.highlighted]];
        console.log(highlighted);
        return (
            <div>
                <ParallelCoordinates
                    width={this.state.width}
                    height={this.state.height}
                    dimensions={this.state.dimensions}
                    data={this.state.data}
                    color={this.state.color}
                    highlighted={highlighted}
                    onBrush={noop}
                    onBrushEnd={d => console.log('brush end', d)}
                    onLineHover={d => console.log('line hover', d)}
                />
                <input type="button" onClick={this.switchColor.bind(this)} value="Switch color"/>&nbsp;
                <input type="button" onClick={this.switchSize.bind(this)} value="Switch size"/>&nbsp;
                <input type="button" onClick={this.switchDimensions.bind(this)} value="Switch dimensions"/>&nbsp;
                <input type="button" onClick={this.switchData.bind(this)} value="Switch data"/>&nbsp;
                <input type="button" onClick={this.switchDummy.bind(this)} value="Switch dummy"/>&nbsp;
                <br/>
                <input type="button" onClick={this.switchHighlighted.bind(this)} value="Switch highlighted"/>&nbsp;
            </div>
        );
    }
}

function noop() {}

ReactDOM.render(
    <App />,
    document.getElementById('example')
);
