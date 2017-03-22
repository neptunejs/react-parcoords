const data = new Array(100);
for (var i = 0; i < data.length; i++) {
    data[i] = {A: rand(), B: rand() / 2, C: rand() * 2};
}

function rand() {
    return Math.round(Math.random() * 100);
}

const dimensions = {
    A: {
        title: 'Title A',
        type: 'number'
    },
    B: {
        title: 'Title B',
        type: 'number'
    },
    C: {
        title: 'Title C',
        type: 'number'
    }
};

const color = ['red', 'green', 'blue'];

export default {
    data, dimensions, color
};
