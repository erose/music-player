import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import SongList from './SongList';
import AudioVisualizer from './audio-visualizer';
jest.mock('./audio-visualizer');

// When code calls setTimeout, we don't want to actually have to wait.
jest.useFakeTimers();

beforeEach(() => {
  AudioVisualizer.mockClear();
});

// Shared.
const songList = (<SongList
  filenames={[
    'U2/Songs of Experience/01 - Zoo Station.mp3',
    'U2/Songs of Experience/03 - One.mp3',
    'U2/Songs of Experience/04 - Until The End Of The World.mp3',
  ]}
  s3Url={'https://elis-music.s3.us-east-2.amazonaws.com/'}
/>);

test('Can render.', () => {
  render(songList);
});

test('Filtering works.', () => {
  const { queryByText, getByRole } = render(songList);

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
  const { getByText, getByRole, getByLabelText } = render(songList);
  fireEvent.change(getByRole('searchbox'), { target: { value: 'Zoo' }});
  jest.advanceTimersByTime(1000); // wait 1 second

  expect(getByText(/Zoo Station/)).not.toHaveClass('playing');

  fireEvent.click(getByLabelText('Play'));

  expect(getByText(/Zoo Station/)).toHaveClass('playing');

  // We need to get through the 'loading' phase, so we manually fire the canPlay event.
  const audioElement = document.getElementsByTagName('audio')[0];
  fireEvent.canPlay(audioElement);

  fireEvent.click(getByLabelText('Pause'));

  expect(getByText(/Zoo Station/)).not.toHaveClass('playing');
});

test('Clicking on a song toggles the document title.', () => {
  const { getByText, getByRole, getByLabelText } = render(songList);

  const spy = jest.spyOn(document, 'title', 'set');
  fireEvent.change(getByRole('searchbox'), { target: { value: 'Zoo' }});
  jest.advanceTimersByTime(1000); // wait 1 second

  expect(spy).not.toHaveBeenCalled();

  fireEvent.click(getByLabelText('Play'));

  expect(spy).toHaveBeenLastCalledWith(`🎶 — 01 - Zoo Station.mp3`);

  // We need to get through the 'loading' phase, so we manually fire the canPlay event.
  const audioElement = document.getElementsByTagName('audio')[0];
  fireEvent.canPlay(audioElement);

  fireEvent.click(getByLabelText('Pause'));

  expect(spy).toHaveBeenLastCalledWith(`🎶`);
});

test('Play the next song after this one finishes.', () => {
  const { getByText, getAllByLabelText, getByRole } = render(songList);

  fireEvent.change(getByRole('searchbox'), { target: { value: 'U2' }});
  jest.advanceTimersByTime(1000); // wait 1 second

  const firstPlayButton = getAllByLabelText('Play')[0];
  fireEvent.click(firstPlayButton);
  // We need to get through the 'loading' phase, so we manually fire the canPlay event.
  const audioElement = document.getElementsByTagName('audio')[0];
  fireEvent.canPlay(audioElement);
  // And then we jump forward to when the song has ended by firing the ended event.
  fireEvent.ended(audioElement);

  // Check that the previous song is not playing.
  expect(getByText(/Zoo Station/)).not.toHaveClass('playing');

  // Check that the next song is playing.
  expect(getByText(/One/)).toHaveClass('playing');
});

test('Clicking play on another song will stop playing the previous song.', () => {
  const { getByText, getAllByLabelText, getByRole } = render(songList);

  fireEvent.change(getByRole('searchbox'), { target: { value: 'U2' }});
  jest.advanceTimersByTime(1000); // wait 1 second

  const firstPlayButton = getAllByLabelText('Play')[0];
  fireEvent.click(firstPlayButton);

  // Check that the song is playing.
  expect(getByText(/Zoo Station/)).toHaveClass('playing');

  const secondPlayButton = getAllByLabelText('Play')[1];
  fireEvent.click(secondPlayButton);

  // Check that the previous song is not playing, but the next one is.
  expect(getByText(/Zoo Station/)).not.toHaveClass('playing');
  expect(getByText(/One/)).toHaveClass('playing');
});

test('Clicking play on another song will *not* stop playing the previous song if the ctrl key is held down.', () => {
  const { getByText, getAllByLabelText, getByRole } = render(songList);

  fireEvent.change(getByRole('searchbox'), { target: { value: 'U2' }});
  jest.advanceTimersByTime(1000); // wait 1 second

  const firstPlayButton = getAllByLabelText('Play')[0];
  fireEvent.keyDown(document, { key: 'Control' });
  fireEvent.click(firstPlayButton);

  // Check that the song is playing.
  expect(getByText(/Zoo Station/)).toHaveClass('playing');

  const secondPlayButton = getAllByLabelText('Play')[1];
  fireEvent.click(secondPlayButton);

  // Check that the previous song is not playing, but the next one is.
  expect(getByText(/Zoo Station/)).toHaveClass('playing');
  expect(getByText(/One/)).toHaveClass('playing');
});

test('Searching and then clicking back undoes the search.', () => {
  const { queryByText, getByRole } = render(songList);

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
  const { queryByText, getByRole } = render(songList);

  jest.spyOn(window.history, 'pushState').mockImplementation(() => null);
  
  fireEvent.change(getByRole('searchbox'), { target: { value: 'Songs of' }});
  jest.advanceTimersByTime(1000); // wait 1 second
  
  expect(window.history.pushState).toHaveBeenCalledWith(
    { searchString: 'Songs of' },
    '',
    expect.stringMatching(/\?search=Songs\+of/),
  );
});

test('Clicking on a song triggers visualizations if party mode is on.', () => {
  const { getByText, getByRole, getByLabelText } = render(songList);
  fireEvent.change(getByRole('searchbox'), { target: { value: 'Zoo' }});
  jest.advanceTimersByTime(1000); // wait 1 second

  fireEvent.click(getByText('OFF')); // turn party mode on
  fireEvent.click(getByLabelText('Play'));

  // We need to get through the 'loading' phase, so we manually fire the canPlay event.
  const audioElement = document.getElementsByTagName('audio')[0];
  fireEvent.canPlay(audioElement);

  expect(AudioVisualizer).toHaveBeenCalledTimes(1);
});
