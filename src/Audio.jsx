import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import './Audio.scss';
import spinner from './spinner.ico';

import AudioVisualizer from './audio-visualizer';

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

    this.audioElement = null; // TODO explain
    this.canvas = React.createRef(); // TODO explain
    this.currentAnimationId = null; // TODO explain
  }

  componentWillUnmount() {
    // Cancel any getDataFromAnalyser calls that may be waiting to run.
    if (this.currentIntervalId) {
      clearInterval(this.currentIntervalId);
    }

    this.stopVisualization();
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

            <audio autoPlay={true} crossOrigin='anonymous' onCanPlay={() => this.onLoadingFinished()}>
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
            
            <audio ref={this.onAudioElementRefAvailable} crossOrigin='anonymous' autoPlay={true} onEnded={() => this.props.onEnded()}>
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

  onAudioElementRefAvailable = (audioElement) => {
    if (audioElement !== null) {
      this.visualizer = new AudioVisualizer(audioElement);
      this.currentAnimationId = requestAnimationFrame(this.draw);
    }
  }

  draw = () => {
    // Retrieve the color appropriate to this moment in the song, and set it.
    document.body.style.backgroundColor = this.visualizer.getColor();

    this.currentAnimationId = requestAnimationFrame(this.draw);
  }

  onPlayPressed() {
    this.props.onPlayPressed();
  }

  onLoadingFinished() {
    this.setState({ loadingStatus: loaded });
  }

  onPausePressed() {
    this.stopVisualization();
    this.props.onPausePressed();
  }

  stopVisualization() {
    document.body.style.backgroundColor = '';
    cancelAnimationFrame(this.currentAnimationId);
    this.currentAnimationId = null;
  }
}

export default Audio;
