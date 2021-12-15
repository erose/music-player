export default class AudioVisualizer {
  constructor(audioElement) {
    this.audioContext = new AudioContext();

    // TODO: Explain.
    this.lowPassFilter = this.audioContext.createBiquadFilter();
    this.lowPassFilter.type = 'lowpass';
    this.highPassFilter = this.audioContext.createBiquadFilter();
    this.highPassFilter.type = "highpass";
    this.lowFreqAnalyser = this.audioContext.createAnalyser();
    this.lowFreqAnalyser.fftSize = 2048;
    this.highFreqAnalyser = this.audioContext.createAnalyser();
    this.highFreqAnalyser.fftSize = 2048;

    this.source = this.audioContext.createMediaElementSource(audioElement);
    this.source.connect(this.lowPassFilter);
    this.source.connect(this.highPassFilter);

    this.lowPassFilter.connect(this.lowFreqAnalyser);
    this.highPassFilter.connect(this.highFreqAnalyser);
    this.source.connect(this.audioContext.destination);
  }

  // Returns a string suitable to be used as the value for CSS 'background-color' or 'color'
  // attributes.
  getColor() {
    // TODO: Explain.
    const bufferLength = this.lowFreqAnalyser.frequencyBinCount;
    const lowFreqDataArray = new Uint8Array(bufferLength);
    const highFreqDataArray = new Uint8Array(bufferLength);
    this.lowFreqAnalyser.getByteTimeDomainData(lowFreqDataArray);
    this.highFreqAnalyser.getByteTimeDomainData(highFreqDataArray);

    const lowFreqMax = Math.max(...lowFreqDataArray);
    const x = 128 + Math.min(Math.exp((lowFreqMax - 128) / 10.0), 128);
    const highFreqMax = Math.max(...highFreqDataArray);
    const y = 128 + Math.min(Math.exp((highFreqMax - 128) / 10.0), 128);
    const z = (x + y) / 2;

    return `rgb(${x}, ${y}, ${z})`;
  }
}
