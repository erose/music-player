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
    filename: PropTypes.string.isRequired,

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
    const filenameClassName = this.props.isPlaying ? 'filename playing' : 'filename';

    if (!this.props.isPlaying) {
      return (
        <div className='Audio' onClick={() => this.onPlayPressed()}>
          <div className='icon-container play-pause' role="button">
            <span role="img" className='play-symbol' aria-label="Play">></span>
          </div>

          <div className={filenameClassName}>
            {this.props.filename}
          </div>
        </div>
      );
    }

    if (this.state.loadingStatus === loading) {
      // The point of this <audio> element is just to load the file. It will actually be played by
      // the <audio> element that is rendered in the other case of this function.
      return (
        <div className='Audio' onClick={() => this.onPausePressed()}>
          <div className='icon-container loading-spinner' role="button">
            <img role="img" src={spinner} className='spinner' alt='' aria-label="Play"></img>

            <audio autoPlay={true} onCanPlay={() => this.onLoadingFinished()}>
              <source src={this.props.url}/>
            </audio>
          </div>

          <div className={filenameClassName}>
            {this.props.filename}
          </div>
        </div>
      );
    }

    if (this.state.loadingStatus === loaded) {
      return (
        <div className='Audio' onClick={() => this.onPausePressed()}>
          <div className='icon-container play-pause' role="button">
            <span role="img" className='pause-symbol' aria-label="Pause">|  |</span>
            
            <audio autoPlay={true} onEnded={() => this.props.onEnded()}>
              <source src={this.props.url}/>
            </audio>
          </div>

          <div className={filenameClassName}>
            {this.props.filename}
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
