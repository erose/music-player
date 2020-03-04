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
      searchString: '',
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
          value={this.state.searchString}
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
    const filtered = this.props.filenames.filter((filename) => filename.includes(searchString));

    return filtered;
  }

  renderFile(filename) {
    return (
      <div className='file-container' key={filename}>
        <Audio
          url={this.props.s3Url + filename}
          onPlayPressed={() => this.setState({ currentlyPlaying: filename })}
          onPausePressed={() => this.setState({ currentlyPlaying: null })}
        />

        <span className={this.state.currentlyPlaying === filename ? 'filename currently-playing' : 'filename'}>
          {filename}
        </span>
      </div>
    );
  }

  onSearchTermChanged(string) {
    // Store the previous state in the browser's history.
    //   - Note that two arguments are required, but most browsers ignore the second argument so we
    //     pass the empty string. https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
    window.history.pushState({ searchString: string }, '');
    this.setState({ searchString: string });
  }
}

export default App;
