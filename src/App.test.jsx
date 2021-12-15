import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import App from './App';

// When code calls setTimeout, we don't want to actually have to wait.
jest.useFakeTimers();

const xmlResponseWithOneKey = `
<?xml version="1.0" encoding="UTF-8"?>
<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <Name>elis-music</Name>
  <Prefix></Prefix>
  <ContinuationToken>1JtCG4iXVsAJpM1WW/pWemByhbH1BoV2yF6jwC08rykZVfZfaZjOg2avlu3wEtNrrnWDaKn8TMkvHryNad26fR8lV9PZOwmvVnUAe1APNdu8=</ContinuationToken>
  <NextContinuationToken>1b8tGilQ/Hghbnla8j+Qu0dTrQ9maM37nUUhtfWt5j7bGL0LxqQEPTkrqbW5NdVNgxsG6TpK9vYklZiOTOo14rxxUXFcQDcbtKyFUbASk3nQ=</NextContinuationToken>
  <KeyCount>1</KeyCount>
  <MaxKeys>1000</MaxKeys>
  <IsTruncated>false</IsTruncated>
  <Contents>
    <Key>Of Montreal/Lousy With Sylvianbriar/Raindrop in My Skull</Key>
    <LastModified>2020-03-07T23:04:07.000Z</LastModified>
    <ETag>&quot;53b5f0b99068d903f8e618e2b81fbae4&quot;</ETag>
    <Size>6851349</Size>
    <StorageClass>STANDARD</StorageClass>
  </Contents>
</ListBucketResult>`;

describe('App', () => {
  test('Can render a song from an XML response.', () => {
    jest.spyOn(global, 'fetch').mockImplementation(
      () => Promise.resolve({ text: () => Promise.resolve(xmlResponseWithOneKey) })
    );

    const { queryByText, getByRole } = render(<App/>);
    process.nextTick(() => { // Give time for our Promises to resolve.
      fireEvent.change(getByRole('searchbox'), { target: { value: 'Of Montreal' }});
      jest.advanceTimersByTime(1000); // wait 1 second

      expect(queryByText(/Raindrop in My Skull/)).not.toBeNull();
    });

    global.fetch.mockReset();
  });

  test('A queryparam autopopulates the searchbox.', () => {
    jest.spyOn(global, 'fetch').mockImplementation(
      () => Promise.resolve({ text: () => Promise.resolve(xmlResponseWithOneKey) })
    );
    window.history.pushState({}, '', '/?search=Of+Montreal');

    const { queryByText, getByRole } = render(<App/>);
    process.nextTick(() => { // Give time for our Promises to resolve.
      expect(queryByText(/Raindrop in My Skull/)).not.toBeNull();
    });

    window.history.back();
    global.fetch.mockReset();
  });

  test('Says "Loading..." until there is data.', () => {
    jest.spyOn(global, 'fetch').mockImplementation(
      () => Promise.resolve({ text: () => Promise.resolve(xmlResponseWithOneKey) })
    );

    const { queryByText, getByRole } = render(<App/>);
    expect(queryByText(/Loading/)).not.toBeNull();

    global.fetch.mockReset();
  });
});
