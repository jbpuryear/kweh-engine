class Config {
  constructor() {
    this.priority = 0;
    this.mute = false;
    this.volume = 1;
    this.pan = 0;
    this.rate = 1;
    this.loop = false;
    this.start = -1;
    this.end = -1;
    this.offset = 0;
  }
}


export default class Sound {
  constructor(audio, buffer) {
    this.audio = audio;
    this.start = 0;
    this.end = buffer.duration;
    this.multiplex = false;
    this._buffer = buffer;
    this._id = -1;
    this._startedAt = -1;
    this._pauseOffset = 0;
    this._conf = new Config();
  }


  play(start = this.start, end = this.end, offset = 0) {
    this._play(false, start, end, offset);
  }


  loop(start = this.start, end = this.end, offset = 0) {
    this._play(true, start, end, offset);
  }


  stop() {
    this.audio.stop(this._id);
    this._startedAt = -1;
    this._pauseOffset = 0;
  }


  pause() {
    if (!this.audio.isPlaying(this._id)) {
      return;
    }
    this.stop();
    const loopDuration = this._conf.end - this._conf.start;
    const elapsed = this.audio.context.currentTime - this._startedAt;
    this._pauseOffset = (elapsed + this._conf.offset) % loopDuration;
  }


  resume() {
    if (this.audio.isPlaying(this._id)) {
      return;
    }
    this._play(this._conf.loop, this._conf.start, this._conf.end, this._pauseOffset);
  }


  get mute() { return this._conf.mute; }
  set mute(value) {
    this._conf.mute = value;
    this.audio.setMute(this._id, value);
  }


  get volume() { return this._conf.volume; }
  set volume(value) {
    this._conf.volume = value;
    this.audio.setVolume(this._id, value);
  }


  get pan() { return this._conf.pan; }
  set pan(value) {
    this._conf.pan = value;
    this.audio.setPan(this._id, value);
  }


  get rate() { return this._conf.rate; }
  set rate(value) {
    this._conf.rate = value;
    this.audio.setRate(this._id, value);
  }


  get priority() { return this._conf.priority; }
  set priority(value) { this._conf.priority = value; }


  _play(loop, start, end, offset) {
    if (!this.multiplex) {
      this.stop();
    }
    this._conf.loop = loop;
    this._conf.start = start;
    this._conf.end = end;
    this._conf.offset = offset;
    this._startedAt = this.audio.context.currentTime;
    this._pauseOffset = -1;
    this._id = this.audio.play(this._buffer, this._conf);
  }
}
