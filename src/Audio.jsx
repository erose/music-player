import React from 'react';

class Audio extends React.Component {
  render() {
    return (
      <audio controls={true}>
        <source src={this.props.url}/>
      </audio>
    );
  }
}

export default Audio;
