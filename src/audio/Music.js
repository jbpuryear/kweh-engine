export default class Music {
  constructor(audio, mediaElement) {
    this._mute = new GainNode(audio.context);
    this._panner = new StereoPannerNode(audio.context);
    this._node = new MediaElementAudioSourceNode(audio.context, { mediaElement });
    this._element = mediaElement;

    this._element.preservesPitch = false;

    this._mute.connect(audio._volume);
    this._panner.connect(this._mute);
    this._node.connect(this._panner);

    audio.events.on('suspended', () => this._element.pause());
    audio.events.on('resumed', () => {
      if (this._playing) {
        this._element.play()
      }
    });

    if (audio.context.state === 'suspended') {
      const callback = () => {
        if (audio.context.state === 'running') {
          this._element.muted = false;
          audio.context.removeEventListener('statechange', callback);
        }
      };
      audio.context.addEventListener('statechange', callback);
      this._element.muted = true;
    }
  }


  play(start = 0) {
    this._element.currentTime = start;
    this._element.play();
    this._playing = true;
  }


  stop() {
    this._element.pause();
    this._element.currentTime = 0;
    this._playing = false;
  }


  pause() {
    this._element.pause();
    this._playing = false;
  }


  resume() {
    this._element.play();
    this._playing = true;
  }


  get mute() { return this._mute.gain.value === 0 }
  set mute(value) { this._mute.gain.value = value ? 0 : 1; }


  get volume() { return this._element.volume; }
  set volume(value) { this._element.volume = value; }


  get pan() { return this._panner.pan.value; }
  set pan(value) { this._panner.pan.value = value; }


  get rate() { return this._element.playbackRate; }
  set rate(value) { return this._element.playbackRate = value; }


  get currentTime() { return this._element.currentTime; }
  set currentTime(value) { this._element.currentTime = value; }
}
