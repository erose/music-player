import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import './SongList.scss';

import Audio from './Audio';

class SongList extends React.Component {
  static propTypes = {
    filenames: PropTypes.arrayOf(PropTypes.string.isRequired), // may be null if we haven't loaded the data yet.
    s3Url: PropTypes.string.isRequired,

    searchString: PropTypes.string, // Optional; what to initialize the searchString prop to.
  };

  constructor(props) {
    super(props);

    this.state = {
      // These pieces of state are for the search feature. The main challenge is that searching
      // through all filenames is expensive, so we don't want to do it on every keystroke. Instead
      // we want to do it when the user pauses typing. So while they're in the middle of typing,
      // we'll have some text in the input box that we haven't actually done a search with yet. We
      // need to represent this intermediate state, so we need to store 1) 'searchString', the thing
      // to be searched, separately from 2) 'visibleFiles', the result of the search.
      visibleFiles: props.filenames === null ? null : [],
      searchString: props.searchString || '',
      
      currentlyPlaying: [], // a list of filename strings (many songs can be playing at once).
    };
  }

  componentDidMount() {
    // Allows use of the 'back' button to go between searches.
    window.addEventListener('popstate', this.handleOnPopState);
  }

  componentWillUnmount() {
    // Allows use of the 'back' button to go between searches.
    window.removeEventListener('popstate', this.handleOnPopState);

    // Cancel any doSearches that may be waiting to run.
    if (this.currentTimeoutId) {
      clearTimeout(this.currentTimeoutId);
    }
  }

  handleOnPopState = (event) => {
    let searchString = '';
    if (event.state) {
      searchString = event.state.searchString;
    }

    this.setState({ searchString, });
    this.doSearch(searchString);
  }

  // If the available filenames change, we need to redo our search. 
  componentDidUpdate(prevProps, _prevState, _snapshot) {
    if (_.isEqual(this.props.filenames, prevProps.filenames)) {
      return;
    }

    this.doSearch(this.state.searchString);
  }

  render() {
    const visibleFiles = this.state.visibleFiles;
    const loadingIndicator = <span>Loading...</span>; // TODO: Make it cool.

    return (
      <div className='SongList'>
        <input
          placeholder="Search..."
          autoFocus={true}
          value={this.state.searchString}
          role={'searchbox'}
          spellCheck="false"
          onFocus={(event) => event.target.select()}
          onChange={(event) => this.onSearchTermChanged(event.target.value)}
        />

        <div style={{marginTop: '1rem'}}>
          {(visibleFiles && visibleFiles.map(this.renderFile)) || loadingIndicator}
        </div>
      </div>
    );
  }

  renderFile = (filename) => {
    const isPlaying = this.state.currentlyPlaying.includes(filename);
    // 'key' is necessary because we want to create a new component when the song is played, rather
    // than updating the existing component instance. We want to do this because we need to reset
    // state. See
    // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
    // .
    const key = `${filename}-${isPlaying}`;

    return (
      <div className='file-container' key={filename}>
        <Audio
          url={this.props.s3Url + filename}
          isPlaying={isPlaying}
          key={key}
          filename={filename}

          onPlayPressed={() => this.startPlaying(filename)}
          onPausePressed={() => this.stopPlaying(filename)}
          onEnded={() => this.onEnded(filename)}
        />
      </div>
    );
  }

  onSearchTermChanged(string) {
    this.setState({ searchString: string });

    // Stop the previous search, if any, from happening; this new one supersedes it.
    if (this.currentTimeoutId) {
      clearTimeout(this.currentTimeoutId);
    }

    const delay = 750; // ms
    this.currentTimeoutId = setTimeout(() => {
      this.doSearch(string);
      this.saveSearchString(string);
    }, delay);
  }

  // Update 'visibleFiles.'
  doSearch(searchString) {
    const downcasedSearchString = searchString.toLowerCase();
    // Display no files on an empty search.
    if (downcasedSearchString === '') {
      this.setState({ visibleFiles: [] });
      return;
    }
    
    const filtered = this.props.filenames.filter(
      (filename) => filename.toLowerCase().includes(downcasedSearchString)
    );
    this.setState({ visibleFiles: filtered });
  }

  // Marks this search string as a 'checkpoint', saving it in the URL and enabling us to use the
  // back button to come back to it later.
  saveSearchString(string) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('search', string);
    
    // See https://developer.mozilla.org/en-US/docs/Web/API/History/pushState . In particular: most
    // browsers ignore the second argument so we pass the empty string.
    window.history.pushState(
      { searchString: string },
      '',
      window.location.origin + window.location.pathname + '?' + urlParams.toString()
    );
  }

  onEnded(filename) {
    const justEndedSongIndex = this.state.visibleFiles.indexOf(filename);
    const nextUpSongIndex = justEndedSongIndex + 1;

    let newCurrentlyPlaying = this.state.currentlyPlaying;
    newCurrentlyPlaying = newCurrentlyPlaying.filter((f) => f !== filename); // stop this song

    if (nextUpSongIndex < this.state.visibleFiles.length) {
      const nextSong = this.state.visibleFiles[nextUpSongIndex];
      newCurrentlyPlaying.push(nextSong);
    } else {
      // If we're at the end, do nothing.
    }

    this.setState({ currentlyPlaying: newCurrentlyPlaying }, () => this.setDocumentTitle());
  }

  startPlaying(filename) {
    this.setState(
      { currentlyPlaying: this.state.currentlyPlaying.concat(filename) },
      () => this.setDocumentTitle()
    );
  }

  stopPlaying(filename) {
    this.setState(
      { currentlyPlaying: this.state.currentlyPlaying.filter((f) => f !== filename) },
      () => this.setDocumentTitle()
    );
  }

  setDocumentTitle() {
    const filename = this.state.currentlyPlaying[0];
    // We just want to show the base part of the filename — not the artist or album.
    const toDisplay = filename && _.last(filename.split('/'));

    if (toDisplay) {
      document.title = `🎶 — ${toDisplay}`;
    } else {
      document.title = `🎶`;
    }
  }
}

export default SongList;
