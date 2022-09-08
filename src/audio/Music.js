export default class Music {
  constructor(audio, mediaElement) {
    this._mute = new GainNode(audio.context);
    this._volume = new GainNode(audio.context);
    this._panner = new StereoPannerNode(audio.context);
    this._node = new MediaElementAudioSourceNode(audio.context, { mediaElement });
    this._element = mediaElement;

    this._mute.connect(audio._volume);
    this._volume.connect(this._mute);
    this._panner.connect(this._volume);
    this._node.connect(this._panner);
  }


  play(start = 0) {
    this._element.currentTime = start;
    this._element.play();
  }


  stop() {
    this._element.pause();
    this._element.currentTime = 0;
  }


  pause() {
    this._element.pause();
  }


  resume() {
    this._element.play();
  }


  get mute() { return this._mute.gain.value === 0 }
  set mute(value) { this._mute.gain.value = value ? 0 : 1; }


  get volume() { return this._volume.gain.value; }
  set volume(value) { this._volume.gain.volume = value }


  get pan() { return this._panner.pan.value; }
  set pan(value) { this._panner.pan.value = value; }


  get rate() { return this._element.playbackRate; }
  set rate(value) { return this._element.playbackRate = value; }


  get currentTime() { return this._element.currentTime; }
  set currentTime(value) { this._element.currentTime = value; }
}
