import React from 'react';
import { render, getByRole, fireEvent } from '@testing-library/react';

import App from './App';

// Shared.
const app = (<App
  filenames={[
    'U2/Songs of Experience/01 - Zoo Station.mp3',
    'U2/Songs of Experience/03 - One.mp3',
    'U2/Songs of Experience/04 - Until The End Of The World.mp3',
  ]}
  s3Url={'https://bucketname.s3.us-east-2.amazonaws.com/'}
/>);

test('Can render.', () => {
  render(app);
});

test('Filtering works.', () => {
  const { queryByText, getByRole } = render(app);

  // Check that all the songs are displaying.
  expect(queryByText(/Zoo Station/)).toBeTruthy();
  expect(queryByText(/One/)).toBeTruthy();
  expect(queryByText(/Until The End Of The World/)).toBeTruthy();

  fireEvent.change(getByRole('searchbox'), { target: { value: 'Zoo' }});

  // Check that just one of the songs is displaying.
  expect(queryByText(/Zoo Station/)).toBeTruthy();
  expect(queryByText(/One/)).toBeFalsy();
  expect(queryByText(/Until The End Of The World/)).toBeFalsy();
});

test('Clicking on a song toggles a class name.', () => {
  const { getByText } = render(app);
  expect(getByText(/Zoo Station/)).not.toHaveClass('currently-playing');

  const container = getByText(/Zoo Station/).parentElement;
  fireEvent.click(getByRole(container, 'button'));

  expect(getByText(/Zoo Station/)).toHaveClass('currently-playing');

  // We need to get through the 'loading' phase, so we manually fire the canPlay event.
  const audioElement = getByRole(container, 'button').getElementsByTagName('audio')[0];
  fireEvent.canPlay(audioElement);

  fireEvent.click(getByRole(container, 'button'));

  expect(getByText(/Zoo Station/)).not.toHaveClass('currently-playing');
})
