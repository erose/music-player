import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import App from './App';

// When code calls setTimeout, we don't want to actually have to wait.
jest.useFakeTimers();

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

  fireEvent.change(getByRole('searchbox'), { target: { value: 'U2' }});
  jest.advanceTimersByTime(1000); // wait 1 second

  // Check that all of the songs are displaying.
  expect(queryByText(/Zoo Station/)).toBeTruthy();
  expect(queryByText(/One/)).toBeTruthy();
  expect(queryByText(/Until The End Of The World/)).toBeTruthy();

  fireEvent.change(getByRole('searchbox'), { target: { value: 'Zoo' }});
  jest.advanceTimersByTime(1000); // wait 1 second

  // Check that just one of the songs is displaying.
  expect(queryByText(/Zoo Station/)).toBeTruthy();
  expect(queryByText(/One/)).toBeFalsy();
  expect(queryByText(/Until The End Of The World/)).toBeFalsy();
});

test('Clicking on a song toggles a class name.', () => {
  const { getByText, getByRole } = render(app);
  fireEvent.change(getByRole('searchbox'), { target: { value: 'Zoo' }});
  jest.advanceTimersByTime(1000); // wait 1 second

  expect(getByText(/Zoo Station/)).not.toHaveClass('currently-playing');

  fireEvent.click(screen.getByRole('button'));

  expect(getByText(/Zoo Station/)).toHaveClass('currently-playing');

  // We need to get through the 'loading' phase, so we manually fire the canPlay event.
  const audioElement = screen.getByRole('button').getElementsByTagName('audio')[0];
  fireEvent.canPlay(audioElement);

  fireEvent.click(screen.getByRole('button'));

  expect(getByText(/Zoo Station/)).not.toHaveClass('currently-playing');
})
