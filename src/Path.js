class Path {
  constructor(s3Key) {
    this.s3Key = s3Key;
  }

  hasPrefix(otherPath) {
    return this.s3Key.startsWith(otherPath.toString());
  }

  withPrefixRemoved(otherPath) {
    return new Path(this.s3Key.replace(otherPath.toString(), ''));
  }

  // e.g. if the path is 'a/b/c', returns [new Path('a'), new Path('a/b'), new Path('a/b/c')]
  subPaths() {
    const result = [];
    const splits = this.s3Key.split('/');

    for (let i = 1; i < splits.length + 1; i++) {
      result.push(new Path(splits.slice(0, i).join('/')));
    }

    return result;
  }

  isPlayable() {
    return this.s3Key.endsWith('mp3');
  }

  // e.g. if the path is 'a/b/c', returns 'c'
  basename() {
    const [result] = this.s3Key.split('/').slice(-1);
    return result;
  }

  slice(a, b) {
    return new Path(this.s3Key.split('/').slice(a, b).join('/'));
  }

  get length() {
    return this.s3Key.split('/').length;
  }

  toString() {
    return this.s3Key;
  }
};

export default Path;
