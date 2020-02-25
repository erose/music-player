import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery'; // We use jQuery just in this file to parse XML and for $(document).ready.
import './index.css';

import App from './App.jsx';
import Path from './Path';

// Globals.
const s3Url = 'https://elis-music.s3.us-east-2.amazonaws.com/';

function propsFromS3Response(xml) {
  const keys = $(xml).find("Contents > Key").toArray().map((node) => node.textContent);
  const paths = keys.map((key) => new Path(key));
  return { paths, s3Url, };
}

$(document).ready(async () => {
  const response = await fetch(s3Url);
  const xml = await response.text();
  
  ReactDOM.render(
    <App {...propsFromS3Response(xml)}/>,
    document.getElementById('root')
  );
});

