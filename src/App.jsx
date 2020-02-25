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
    const currentPath = this.state.currentPath.toString();

    // Show the common prefixes of paths which are visible from the current path.
    const visiblePaths = this.props.paths.filter(
      (path) => path.hasPrefix(currentPath)
    ).map(
      (path) => path.withPrefixRemoved(currentPath)
    );
    const visibleTopLevelPaths = this.topLevelPrefixes(visiblePaths);

    return (
      <div>
        <div>{"Current path: " + this.state.currentPath.toString()}</div>
        <div>{visibleTopLevelPaths.map((path) => this.renderPath(path))}</div>
      </div>
    );
  }

  // Returns the prefixes that all of the passed-in paths have in common.
  topLevelPrefixes(paths) {
    return _.uniq(
      paths.map((path) => path.toString().split('/')[0])
    ).map(
      (s) => new Path(s)
    );
  }

  renderPath(path) {
    // A path is rendered in segments (e.g. ['U2', 'Songs of Forgiveness', 'One.mp3'], where each
    // segment can be clicked on to navigate there.

    const segmentElements = path.subPaths().map((subPath, i, allSubPaths) => {
      // Include another <span> with a '/' in it, if this isn't the last segment.
      let slashSpanElement = null;
      if (i !== allSubPaths.length - 1) {
        slashSpanElement = (
          <span style={{marginLeft: '5px', marginRight: '5px'}}>
            /
          </span>
        );
      }

      return (
        <span key={subPath}>
          <button onClick={() => this.onSegmentClicked(subPath + "/")}>
            {subPath.basename()}
          </button>
          {slashSpanElement}
        </span>
      );
    });

    if (path.isPlayable()) {
      return (
        <div key={path}>
          <div>{segmentElements}</div>
          <Audio url={this.props.s3Url + path.toString()}/>
        </div>
      );
    } else {
      return (
        <div key={path}>
          {segmentElements}
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
