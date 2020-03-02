import React from 'react';
import _ from 'lodash';
import './App.css';

import Path from './Path';
import Audio from './Audio';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // Where are we at in the directory tree of our S3 bucket?
      currentPath: new Path(''),
    };
  }

  componentDidMount() {
    window.addEventListener('popstate', (event) => this.handleOnPopState(event));

    // We need an entry in the history to start things off.
    window.history.pushState({ pathString: '' }, '');
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', (event) => this.handleOnPopState(event));
  }

  handleOnPopState(event) {
    if (event.state) {
      this.setState({ currentPath: new Path(event.state.pathString) });
    }
  }

  render() {
    return (
      <div>
        {this.state.currentPath.length > 1 ? this.renderCurrentPath() : null}

        <div style={{marginTop: '1rem'}}>
          {this.visiblePaths().map((path) => this.renderPath(path))}
        </div>
      </div>
    );
  }

  renderCurrentPath() {
    // The current path is rendered in segments (e.g. ['U2', 'Songs of Forgiveness', 'One.mp3'],
    // where each segment can be clicked on to navigate there.

    const segmentElements = this.state.currentPath.subPaths().map((subPath, i, allSubPaths) => {
      const isLastSegment = i === allSubPaths.length - 1;

      // Include another <span> with a '/' in it, if this isn't the last segment.
      let slashSpanElement = null;
      if (!isLastSegment) {
        slashSpanElement = (
          <span style={{marginLeft: '5px', marginRight: '5px'}}>
            /
          </span>
        );
      }

      let className = null;
      if (isLastSegment) {
        className = 'path last-segment'
      } else {
        className = 'path';
      }

      return (
        <span key={subPath}>
          <button className={className} onClick={() => this.onSegmentClicked(new Path(subPath + "/"))}>
            {subPath.basename()}
          </button>
          {slashSpanElement}
        </span>
      );
    });

    return (
      <div>
        {segmentElements}
      </div>
    );
  }

  visiblePaths() {
    const currentPath = this.state.currentPath;
    const filtered = this.props.paths.filter((path) => path.hasPrefix(currentPath));
    const summarized = _.uniqBy(
      filtered.map((path) => path.slice(0, currentPath.length)),
      (path) => path.toString(),
    );

    return summarized;
  }

  renderPath(path) {
    if (path.isPlayable()) {
      return (
        <div style={{ display: 'flex' }} key={path}>
          <Audio url={this.props.s3Url + path.toString()}/>

          <button className='path unclickable'>
            {path.basename()}
          </button>
        </div>
      );
    } else {
      return (
        <div key={path}>
          <button className='path' onClick={() => this.onSegmentClicked(new Path(path + "/"))}>
            {path.basename()}
          </button>
        </div>
      );
    }

  }

  onSegmentClicked(path) {
    // Store the previous state in the browser's history.
    //   - Note that two arguments are required, but most browsers ignore the second argument so we
    //     pass the empty string. https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
    window.history.pushState({ pathString: this.state.currentPath.toString() }, '');
    this.setState({ currentPath: path });
  }
}

export default App;
