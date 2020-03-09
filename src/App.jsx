import React from 'react';
import PropTypes from 'prop-types';

import './App.scss';

import Audio from './Audio';

class App extends React.Component {
  static propTypes = {
    filenames: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    s3Url: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      // These pieces of state are for the search feature. The main challenge is that searching
      // through all filenames is expensive, so we don't want to do it on every keystroke. Instead
      // we want to do it when the user pauses typing. So while they're in the middle of typing,
      // we'll have some text in the input box that we haven't actually done a search with yet. We
      // need to represent this intermediate state.
      // 'searchString' is what the current search is for.
      searchString: '',
      // 'searchInputValue' is the contents of the search box.
      searchInputValue: '',
      currentTimeoutId: null, // implementation detail.

      currentlyPlaying: null, // a filename string
    };
  }

  componentDidMount() {
    window.addEventListener('popstate', (event) => this.handleOnPopState(event));
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', (event) => this.handleOnPopState(event));
  }

  handleOnPopState(event) {
    if (event.state) {
      this.setState({ searchString: event.state.searchString });
    }
  }

  render() {
    return (
      <div className='App'>
        <input
          placeholder="Search..."
          autoFocus={true}
          value={this.state.searchInputValue}
          role={'searchbox'}
          onChange={(event) => this.onSearchTermChanged(event.target.value)}
        />

        <div style={{marginTop: '1rem'}}>
          {this.visibleFiles().map((filename) => this.renderFile(filename))}
        </div>
      </div>
    );
  }

  visibleFiles() {
    const searchString = this.state.searchString;
    if (searchString === '') { // Display no files initially.
      return [];
    }
    
    const filtered = this.props.filenames.filter((filename) => filename.includes(searchString));
    return filtered;
  }

  renderFile(filename) {
    const isPlaying = filename === this.state.currentlyPlaying;
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

          onPlayPressed={() => this.setState({ currentlyPlaying: filename })}
          onPausePressed={() => this.setState({ currentlyPlaying: null })}
          onEnded={() => this.onEnded(filename)}
        />

        <span className={isPlaying ? 'filename playing' : 'filename'}>
          {filename}
        </span>
      </div>
    );
  }

  onSearchTermChanged(string) {
    this.setState({ searchInputValue: string });

    // Stop the previous update, if any, from happening; this new one supersedes it.
    if (this.state.currentTimeoutId) {
      clearTimeout(this.state.currentTimeoutId);
    }

    const delay = 750; // ms
    const id = setTimeout(() => this.updateSearchString(string), delay);
    this.setState({ currentTimeoutId: id });
  }

  updateSearchString(string) {
    this.setState({ searchString: string });
    // Store the previous state in the browser's history.
    //   - Note that two arguments are required, but most browsers ignore the second argument so we
    //     pass the empty string. https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
    window.history.pushState({ searchString: string }, '');
  }

  onEnded(filename) {
    const visibleFiles = this.visibleFiles();

    const justEndedSongIndex = visibleFiles.indexOf(filename);
    const nextUpSongIndex = justEndedSongIndex + 1;

    if (nextUpSongIndex < visibleFiles.length) {
      this.setState({ currentlyPlaying: visibleFiles[nextUpSongIndex] });
    } else {
      // If we're at the end, do nothing.
    }
  }
}

export default App;
