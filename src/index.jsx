import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery'; // We use jQuery just in this file to parse XML and for $(document).ready.
import './index.css';

import App from './App.jsx';

// Globals.
const s3Url = 'https://elis-music.s3.us-east-2.amazonaws.com/';

async function getProps() {
  const filenames = [];
  let continuationToken = null;

  while (true) {
    let paramString = 'list-type=2';
    if (continuationToken) {
      paramString += `&continuation-token=${encodeURIComponent(continuationToken)}`
    }
    const response = await fetch(s3Url + '?' + paramString);
    const xml = await response.text();
    filenames.push(...$(xml).find("Contents > Key").toArray().map((node) => node.textContent));

    if ($(xml).find("IsTruncated").text() !== 'true') { break; }
    continuationToken = $(xml).find("NextContinuationToken").text();
  }
  return { filenames, s3Url, };
}

$(document).ready(async () => {
  const appProps = await getProps();

  ReactDOM.render(
    <App {...appProps}/>,
    document.getElementById('root')
  );
});

