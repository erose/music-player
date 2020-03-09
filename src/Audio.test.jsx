import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Audio from './Audio';

// Shared.
const url = 'https://elis-music.s3.us-east-2.amazonaws.com/U2/Achtung Baby/01 - Zoo Station.mp3';
const id = (x) => x;

test('Can render.', () => {
  render(<Audio url={url} isPlaying={false} onPlayPressed={id} onPausePressed={id}/>);
});

test('Clicking play triggers the callback.', () => {
  const mockCallback = jest.fn();
  const { getByRole } = render(
    <Audio url={url} isPlaying={false} onPlayPressed={mockCallback} onPausePressed={id}/>
  );

  fireEvent.click(getByRole('button'));
  expect(mockCallback).toHaveBeenCalled();
});

test('Clicking pause triggers the callback', () => {
  const mockCallback = jest.fn();
  const { getByRole, queryByLabelText, getByLabelText } = render(
    <Audio url={url} isPlaying={true} onPlayPressed={id} onPausePressed={mockCallback}/>
  );

  // We need to get through the 'loading' phase, so we manually fire the canPlay event.
  const audioElement = getByRole('button').getElementsByTagName('audio')[0];
  fireEvent.canPlay(audioElement);

  // Check that there's a pause button here and click it.
  expect(queryByLabelText('Pause')).toBeTruthy();
  fireEvent.click(getByLabelText('Pause'));

  expect(mockCallback).toHaveBeenCalled();
});

test('Audio can be played.', () => {
  const { getByRole, queryByLabelText } = render(
    <Audio url={url} isPlaying={true} onPlayPressed={id} onPausePressed={id}/>
  );

  // We need to get through the 'loading' phase, so we manually fire the canPlay event.
  let audioElement = getByRole('button').getElementsByTagName('audio')[0];
  fireEvent.canPlay(audioElement);

  expect(queryByLabelText('Pause')).toBeTruthy();
});

test('Calls onEnded when the audio is finished playing.', () => {
  const mockCallback = jest.fn();
  const { getByRole, queryByLabelText, getByLabelText } = render(
    <Audio url={url} isPlaying={true} onPlayPressed={id} onPausePressed={id} onEnded={mockCallback}/>
  );

  // We need to get through the 'loading' phase, so we manually fire the canPlay event.
  let audioElement = getByRole('button').getElementsByTagName('audio')[0];
  fireEvent.canPlay(audioElement);

  // Fire an onEnded event and assert that the callback is called.
  audioElement = getByRole('button').getElementsByTagName('audio')[0];
  fireEvent.ended(audioElement);

  expect(mockCallback).toHaveBeenCalled();
});
