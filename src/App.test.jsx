import React from 'react';
import { render, fireEvent, getByText } from '@testing-library/react';

import App from './App';
import Path from './Path';

// Shared.
const app = (<App
  paths={[new Path('U2/Songs of Experience/One.mp3')]}
  s3Url={'https://bucketname.s3.us-east-2.amazonaws.com/'}
/>);

test('Renders.', () => {
  render(app);
});

test('Can navigate to an artist, then an album.', () => {
  const { container, getByText, getByTestId } = render(app);
  
  fireEvent.click(getByText('U2'));
  expect(container).toHaveTextContent('U2/');

  fireEvent.click(getByText('Songs of Experience'));
  expect(container).toHaveTextContent('U2/Songs of Experience/');
});
