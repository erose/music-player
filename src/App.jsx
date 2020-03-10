import React from 'react';
import $ from 'jquery'; // We use jQuery just in this file to parse XML.

import SongList from './SongList';

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

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      keys: null, // list of strings; the keys we've loaded from S3. null if we haven't loaded them yet.
    };
  }

  componentDidMount() {
    getKeysInS3Bucket().then((keys) => this.setState({ keys }));
  }

  render() {
    // Try to extract searchString from queryparams; if it's not present, the result will be null.
    const searchString = (new URLSearchParams(window.location.search)).get('search');
    
    return (
      <SongList filenames={this.state.keys} s3Url={s3Url} searchString={searchString}/>
    )
  }  
}

export default App;
