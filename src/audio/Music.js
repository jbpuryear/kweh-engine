import { AUDIO_SUSPEND, AUDIO_RESTORE } from './Audio.js';


export default class Music {
  constructor(audio, mediaElement) {
    this._audio = audio;
    this._mute = new GainNode(audio.context);
    this._panner = new StereoPannerNode(audio.context);
    this._node = new MediaElementAudioSourceNode(audio.context, { mediaElement });
    this._element = mediaElement;
    this._playing = false;
    this.key = '';

    this._element.preservesPitch = false;

    this._mute.connect(audio._volume);
    this._panner.connect(this._mute);
    this._node.connect(this._panner);

    this._onSuspend = () => this._element.pause();
    this._onRestore = () => {
      if (this._playing) {
        this._element.play()
      }
    };
    this._onEnded = () => this._playing = false;
    this._onStateChange = null;

    audio.events.on(AUDIO_SUSPEND, this._onSuspend);
    audio.events.on(AUDIO_RESTORE, this._onRestore);
    this._element.addEventListener('ended', this._onEnded);

    if (audio.context.state === 'suspended') {
      this._onStateChange = () => {
        if (audio.context.state === 'running') {
          this._element.muted = false;
          audio.context.removeEventListener('statechange', this._onStateChange);
          this._onStateChange = null;
        }
      };
      audio.context.addEventListener('statechange', this._onStateChange);
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
    if (!this._element.ended) {
      this._element.play();
      this._playing = true;
    }
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


  destroy() {
    this._mute.disconnect();
    this._element.removeEventListener('ended', this._onEnded);
    this._element.pause();
    this._element.removeAttribute('src');
    this._element.load();
    this._element = null;
    this._audio.events.off(AUDIO_SUSPEND, this._onSuspend);
    this._audio.events.off(AUDIO_RESTORE, this._onRestore);
    if (this._onStateChange) {
      this._audio.context.removeEventListener('statechange', this._onStateChange);
    }
  }
}
