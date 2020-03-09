import React from 'react';
import PropTypes from 'prop-types';

import './SongList.scss';

import Audio from './Audio';

class SongList extends React.Component {
  static propTypes = {
    filenames: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
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
      visibleFiles: [],
      searchString: props.searchString || '',
      
      currentlyPlaying: [], // a list of filename strings (many songs can be playing at once).
    };
  }

  componentDidMount() {
    this.updateVisibleFiles(this.state.searchString);

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
    this.updateVisibleFiles(searchString);
  }

  render() {
    return (
      <div className='SongList'>
        <input
          placeholder="Search..."
          autoFocus={true}
          value={this.state.searchString}
          role={'searchbox'}
          onChange={(event) => this.onSearchTermChanged(event.target.value)}
        />

        <div style={{marginTop: '1rem'}}>
          {this.state.visibleFiles.map((filename) => this.renderFile(filename))}
        </div>
      </div>
    );
  }

  renderFile(filename) {
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

          onPlayPressed={() => this.startPlaying(filename)}
          onPausePressed={() => this.stopPlaying(filename)}
          onEnded={() => this.onEnded(filename)}
        />

        <span className={isPlaying ? 'filename playing' : 'filename'}>
          {filename}
        </span>
      </div>
    );
  }

  onSearchTermChanged(string) {
    this.setState({ searchString: string });

    // Stop the previous update, if any, from happening; this new one supersedes it.
    if (this.currentTimeoutId) {
      clearTimeout(this.currentTimeoutId);
    }

    const delay = 750; // ms
    this.currentTimeoutId = setTimeout(() => this.doSearch(string), delay);
  }

  doSearch(string) {
    this.updateVisibleFiles(string);
    this.saveSearchString(string);
  }

  // Store the search string in the URL as a queryparam so we can share a link to this search with
  // others, and so we can come back to this search using the back button.
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

  updateVisibleFiles(searchString) {
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

  onEnded(filename) {
    const justEndedSongIndex = this.state.visibleFiles.indexOf(filename);
    const nextUpSongIndex = justEndedSongIndex + 1;

    if (nextUpSongIndex < this.state.visibleFiles.length) {
      const nextSong = this.state.visibleFiles[nextUpSongIndex];
      this.startPlaying(nextSong);
    } else {
      // If we're at the end, do nothing.
    }
  }

  startPlaying(filename) {
    this.setState({ currentlyPlaying: this.state.currentlyPlaying.concat(filename) });
  }

  stopPlaying(filename) {
    this.setState({ currentlyPlaying: this.state.currentlyPlaying.filter((f) => f !== filename) })
  }
}

export default SongList;
