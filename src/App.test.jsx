import React from 'react';
import { render, fireEvent } from '@testing-library/react';

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
  s3Url={'https://elis-music.s3.us-east-2.amazonaws.com/'}
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
  expect(queryByText(/One/)).toBeNull();
  expect(queryByText(/Until The End Of The World/)).toBeNull();

  // Check that filtering is case-insensitive.
  fireEvent.change(getByRole('searchbox'), { target: { value: 'zoo' }});
  jest.advanceTimersByTime(1000); // wait 1 second
  expect(queryByText(/Zoo Station/)).toBeTruthy();
});

test('Clicking on a song toggles a class name.', () => {
  const { getByText, getByRole } = render(app);
  fireEvent.change(getByRole('searchbox'), { target: { value: 'Zoo' }});
  jest.advanceTimersByTime(1000); // wait 1 second

  expect(getByText(/Zoo Station/)).not.toHaveClass('playing');

  fireEvent.click(getByRole('button'));

  expect(getByText(/Zoo Station/)).toHaveClass('playing');

  // We need to get through the 'loading' phase, so we manually fire the canPlay event.
  const audioElement = getByRole('button').getElementsByTagName('audio')[0];
  fireEvent.canPlay(audioElement);

  fireEvent.click(getByRole('button'));

  expect(getByText(/Zoo Station/)).not.toHaveClass('playing');
});

test('Play the next song after this one finishes.', () => {
  const { getAllByRole, getByText, getByRole } = render(app);

  fireEvent.change(getByRole('searchbox'), { target: { value: 'U2' }});
  jest.advanceTimersByTime(1000); // wait 1 second

  fireEvent.click(getAllByRole('button')[0]);
  // We need to get through the 'loading' phase, so we manually fire the canPlay event.
  const audioElement = getAllByRole('button')[0].getElementsByTagName('audio')[0];
  fireEvent.canPlay(audioElement);
  // And then we jump forward to when the song has ended by firing the ended event.
  fireEvent.ended(audioElement);

  // Check that the next song is playing.
  expect(getByText(/One/)).toHaveClass('playing');
});

test('Searching and then clicking back undoes the search.', () => {
  const { queryByText, getByRole } = render(app);

  fireEvent.change(getByRole('searchbox'), { target: { value: 'U2' }});
  jest.advanceTimersByTime(1000); // wait 1 second

  // Check that all of the songs are displaying.
  expect(queryByText(/Zoo Station/)).toBeTruthy();
  expect(queryByText(/One/)).toBeTruthy();
  expect(queryByText(/Until The End Of The World/)).toBeTruthy();

  // jsdom doesn't handle navigation, so we manually fire the popState event.
  fireEvent.popState(document)

  // Check that none of the songs are displaying.
  expect(queryByText(/Zoo Station/)).toBeNull();
  expect(queryByText(/One/)).toBeNull();
  expect(queryByText(/Until The End Of The World/)).toBeNull();
});

test('Searching populates a query param.', () => {
  const { queryByText, getByRole } = render(app);

  fireEvent.change(getByRole('searchbox'), { target: { value: 'U2' }});
  jest.advanceTimersByTime(1000); // wait 1 second

  expect(window.location.search).toBe('?search=U2');
});
