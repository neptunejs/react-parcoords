import React from 'react'; // eslint-disable-line no-unused-vars
import renderer from 'react-test-renderer';

import ParallelCoordinates from '../ParallelCoordinates';

test('Component renders', () => {
  const component = renderer.create(<ParallelCoordinates />);
  let tree = component.toJSON();

  expect(tree).toMatchSnapshot();
});
