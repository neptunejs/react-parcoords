# react-parcoords [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> A react wrapper around d3 parallel-coordinates

## Installation

```sh
$ npm install --save react-parcoords
```

## Usage example
```jsx
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {ParallelCoordinates} from '../../src';

const dimensions = {
    A: {
        title: 'Title A',
        type: 'number'
    },
    B: {
        title: 'Title B',
        type: 'number'
    }
};

const data = [
    {A: 1, B:4},
    {A: 4, B:3},
    {A: 3, B: 1}
];

const props = {
    color: 'red',
    width: 800,
    height: 300,
    dimensions,
    data: data,
    highlights: [],
    onBrush: console.log,
    onBrushEnd: console.log,
    onLineHover: console.log,
    onLinesHover: console.log
};


ReactDOM.render(
    <ParallelCoordinates {...props}/>,
    document.getElementById('example')
);

```

## License

MIT

d3.parcoords.js and d3.parcoords.css licensed under BSD-3-Clause.

[npm-image]: https://badge.fury.io/js/react-parcoords.svg
[npm-url]: https://npmjs.org/package/react-parcoords
[travis-image]: https://travis-ci.org/neptunjs/react-parcoords.svg?branch=master
[travis-url]: https://travis-ci.org/neptunjs/react-parcoords
[daviddm-image]: https://david-dm.org/neptunjs/react-parcoords.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/neptunjs/react-parcoords
