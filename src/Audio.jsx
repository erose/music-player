import React from 'react';
import './Audio.scss';

const notPlaying = 'notPlaying';
const loading = 'loading';
const playing = 'playing';

class Audio extends React.Component {
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
          <div className='play-pause-symbol-container' role="button" onClick={() => this.setState({ status: loading })}>
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

            <audio autoPlay={true} onCanPlay={() => this.setState({ status: playing })}>
              <source src={this.props.url}/>
            </audio>
          </div>
        </div>
      );
    }

    if (this.state.status === playing) {
      return (
        <div className='Audio'>
          <div className='play-pause-symbol-container' role="button" onClick={() => this.setState({ status: notPlaying })}>
            <span role="img" className='pause-symbol' aria-label="Pause">⏸️</span>
            
            <audio autoPlay={true}>
              <source src={this.props.url}/>
            </audio>
          </div>
        </div>
      );
    }
  }
}

export default Audio;
