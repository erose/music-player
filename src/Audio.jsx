import React from 'react';
import PropTypes from 'prop-types';

import './Audio.scss';

// Enum.
const notPlaying = 'notPlaying';
const loading = 'loading';
const playing = 'playing';

class Audio extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,

    onPlayPressed: PropTypes.func,
    onPausePressed: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      status: notPlaying,
    }
  }

  render() {
    if (this.state.status === notPlaying) {
      return (
        <div className='Audio'>
          <div className='play-pause-symbol-container' role="button" onClick={() => this.onPlayPressed()}>
            <span role="img" className='play-symbol' aria-label="Play">▶️</span>
          </div>
        </div>
      );
    }

    if (this.state.status === loading) {
      return (
        <div className='Audio'>
          <div className='loading-spinner-container' role="button">
            <img role="img" src='/spinner.ico' className='spinner' alt='' aria-label="Play"></img>

            <audio autoPlay={true} onCanPlay={() => this.onLoadingFinished()}>
              <source src={this.props.url}/>
            </audio>
          </div>
        </div>
      );
    }

    if (this.state.status === playing) {
      return (
        <div className='Audio'>
          <div className='play-pause-symbol-container' role="button" onClick={() => this.onPausePressed()}>
            <span role="img" className='pause-symbol' aria-label="Pause">⏸️</span>
            
            <audio autoPlay={true}>
              <source src={this.props.url}/>
            </audio>
          </div>
        </div>
      );
    }
  }

  onPlayPressed() {
    this.setState({ status: loading });
    this.props.onPlayPressed();
  }

  onLoadingFinished() {
    this.setState({ status: playing });
  }

  onPausePressed() {
    this.setState({ status: notPlaying });
    this.props.onPausePressed();
  }
}

export default Audio;
