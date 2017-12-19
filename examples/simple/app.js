import React from 'react';
import ReactDOM from 'react-dom';
import data from './data';

import {ParallelCoordinates} from '../../src';

const props = {
    color: 'red',
    width: 800,
    height: 300,
    dimensions: data.dimensions,
    data: data.data,
    highlights: [],
    onBrush: console.log,
    onBrushEnd: console.log,
    onLineHover: console.log,
    onLinesHover: console.log,
    onExtentsChanged: console.log
};


ReactDOM.render(
    <ParallelCoordinates {...props} />,
    document.getElementById('example')
);
