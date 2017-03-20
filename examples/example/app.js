import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import data from './data';

import {ParallelCoordinates} from '../../src';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div>
                <ParallelCoordinates
                    width={1200}
                    height={300}
                    dimensions={data.dimensions}
                    data={data.data}
                    colour={data.color}
                    onBrush_extents={noop}
                    onBrushEnd_extents={noop}
                    onBrushEnd_data={noop}
                    onLineHover={noop}
                />
            </div>
        );
    }
}

function noop() {}

ReactDOM.render(
    <App />,
    document.getElementById('example')
);
