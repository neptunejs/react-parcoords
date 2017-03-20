import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import data from './data';

import {ParallelCoordinates} from '../../src';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            color: 'red'
        }
    }
    switchColor() {
        this.setState({
            color: this.state.color === 'red' ? 'blue' : 'red'
        });
    }

    render() {
        return (
            <div>
                <ParallelCoordinates
                    width={1200}
                    height={300}
                    dimensions={data.dimensions}
                    data={data.data}
                    color={this.state.color}
                    onBrush={noop}
                    onBrushEnd={d => console.log('brush end', d)}
                    onLineHover={d => console.log('line hover', d)}
                />
                <input type="button" onClick={this.switchColor.bind(this)} value="Switch color"/>
            </div>
        );
    }
}

function noop() {}

ReactDOM.render(
    <App />,
    document.getElementById('example')
);
