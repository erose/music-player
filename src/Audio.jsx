import React from 'react';
import PropTypes from 'prop-types';

import './Audio.scss';
import spinner from './spinner.ico';

// Enum.
const loading = 'loading';
const loaded = 'loaded';

class Audio extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    isPlaying: PropTypes.bool.isRequired,

    onPlayPressed: PropTypes.func.isRequired,
    onPausePressed: PropTypes.func.isRequired,
    onEnded: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      loadingStatus: props.isPlaying ? loading : null,
    }
  }

  render() {
    if (!this.props.isPlaying) {
      return (
        <div className='Audio'>
          <div className='play-pause-symbol-container' role="button" onClick={() => this.onPlayPressed()}>
            <span role="img" className='play-symbol' aria-label="Play">▶️</span>
          </div>
        </div>
      );
    }

    if (this.state.loadingStatus === loading) {
      // The point of this <audio> element is just to load the file. It will actually be played by
      // the <audio> element that is rendered in the other case of this function.
      return (
        <div className='Audio'>
          <div className='loading-spinner-container' role="button">
            <img role="img" src={spinner} className='spinner' alt='' aria-label="Play"></img>

            <audio autoPlay={true} onCanPlay={() => this.onLoadingFinished()}>
              <source src={this.props.url}/>
            </audio>
          </div>
        </div>
      );
    }

    if (this.state.loadingStatus === loaded) {
      return (
        <div className='Audio'>
          <div className='play-pause-symbol-container' role="button" onClick={() => this.onPausePressed()}>
            <span role="img" className='pause-symbol' aria-label="Pause">⏸️</span>
            
            <audio autoPlay={true} onEnded={() => this.props.onEnded()}>
              <source src={this.props.url}/>
            </audio>
          </div>
        </div>
      );
    }
  }

  onPlayPressed() {
    this.props.onPlayPressed();
  }

  onLoadingFinished() {
    this.setState({ loadingStatus: loaded });
  }

  onPausePressed() {
    this.props.onPausePressed();
  }
}

export default Audio;
