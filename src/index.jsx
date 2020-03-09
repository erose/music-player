import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery'; // We use jQuery just in this file to parse XML and for $(document).ready.
import './index.css';

import App from './App.jsx';

// Globals.
const s3Url = 'https://elis-music.s3.us-east-2.amazonaws.com/';

async function getKeysInS3Bucket() {
  const keys = [];
  let continuationToken = null;

  while (true) {
    let paramString = 'list-type=2';
    if (continuationToken) {
      paramString += `&continuation-token=${encodeURIComponent(continuationToken)}`
    }
    const response = await fetch(s3Url + '?' + paramString);
    const xml = await response.text();
    const newkeys = $(xml).find("Contents > Key").toArray().map((node) => node.textContent);
    keys.push(...newkeys);

    if ($(xml).find("IsTruncated").text() !== 'true') { break; }
    continuationToken = $(xml).find("NextContinuationToken").text();
  }
  return keys;
}

$(document).ready(async () => {
  const keys = await getKeysInS3Bucket();

  ReactDOM.render(
    <App filenames={keys} s3Url={s3Url}/>,
    document.getElementById('root')
  );
});

