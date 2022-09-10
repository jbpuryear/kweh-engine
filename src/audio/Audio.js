class ActiveSound {
  constructor(audio) {
    this.mute = new GainNode(audio.context);
    this.volume = new GainNode(audio.context);
    this.panner = new StereoPannerNode(audio.context);
    this.source = null;
    this.priority = 0;
    this.rate = 1;
    this.id = -1;
    this.loop = false;
    this.ended = true;

    this.mute.connect(audio._volume);
    this.volume.connect(this.mute);
    this.panner.connect(this.volume);
  }
}


export default class Audio {
  constructor(maxSounds = 32) {
    const context = new AudioContext();
    this.context = context;
    this._mute = new GainNode(this.context);
    this._volume = new GainNode(this.context);
    this._rate = 1;
    this._id = 1;
    this._idToIndex = new Map();
    this._activeIndex = 0;
    this._activeSounds = new Array(maxSounds);

    for (let i = 0; i < maxSounds; i += 1) {
      this._activeSounds[i] = new ActiveSound(this);
    }

    this._mute.connect(this.context.destination);
    this._volume.connect(this._mute);

    if (context.state === 'suspended') {
      const callback = () => {
        const promise = context.resume();
        if (promise) {
          promise.then(() => {
            document.removeEventListener('mousedown', callback);
            document.removeEventListener('keydown', callback);
          });
        } else if (context.state === 'running') {
          document.removeEventListener('mousedown', callback);
          document.removeEventListener('keydown', callback);
        }
      };
      document.addEventListener('mousedown', callback);
      document.addEventListener('keydown', callback);
    }
  }


  play(buffer, options = null) {
    const priority = options?.priority ?? 0;
    let i = this._activeIndex;
    let end = i;
    let lowestIndex = -1;
    let lowestPriority = Infinity;
    const length = this._activeSounds.length;
    do {
      const sound = this._activeSounds[i];
      if (sound.ended) {
        return this._swapSound(buffer, i, options);
      }
      if (sound.priority < lowestPriority) {
        lowestIndex = i;
        lowestPriority = sound.priority;
      }
      i = (i + 1) % length;
    } while (i !== end);

    if (lowestPriority <= priority) {
      return this._swapSound(buffer, lowestIndex, options);
    }
    return -1;
  }


  stop(id) {
    const i = this._idToIndex.get(id) ?? -1;
    this._idToIndex.delete(id);

    if (i === -1) {
      return false;
    }

    const sound = this._activeSounds[i];
    if (!sound.ended) {
      sound.loop = false;
      sound.source.stop();
      return true;
    }

    return false;
  }


  stopAll() {
    const sounds = this._activeSounds;
    for (const i of this._idToIndex.values()) {
      const sound = sounds[i];
      sound.loop = false;
      sound.source.stop();
    }
    this._idToIndex.clear();
  }


  pause() {
    this.context.suspend();
  }


  resume() {
    this.context.resume();
  }


  get mute() { return this._mute.gain.value === 0; }
  set mute(value) { this._mute.gain.value = value ? 0 : 1 }


  get volume() { return this._volume.gain.value; }
  set volume(value) { this._volume.gain.volume = value }


  get rate() { return this._rate; }
  set rate(value) {
    this._rate = value;
    const sounds = this._activeSounds;
    for (const i of this._idToIndex.values()) {
      const sound = sounds[i];
      sound.source.playbackRate.value = sound.rate * this._rate;
    }
  }


  isPlaying(id) {
    return this._idToIndex.has(id);
  }


  setMute(id, value) {
    const i = this._idToIndex.get(id) ?? -1;
    if (i !== -1) {
      this._activeSounds[i].mute.gain.value = value ? 0 : 1;
    }
  }


  setVolume(id, value) {
    const i = this._idToIndex.get(id) ?? -1;
    if (i !== -1) {
      this._activeSounds[i].volume.gain.value = value;
    }
  }


  setPan(id, value) {
    const i = this._idToIndex.get(id) ?? -1;
    if (i !== -1) {
      this._activeSounds[i].panner.pan.value = value;
    }
  }


  setRate(id, value) {
    const i = this._idToIndex.get(id) ?? -1;
    if (i !== -1) {
      const sound = this._activeSounds[i];
      sound.rate = value;
      sound.source.playbackRate.value = value * this._rate;
    }
  }


  _swapSound(buffer, index, options) {
    const sound = this._activeSounds[index];
    const id = this._id++;

    this._activeIndex = (index + 1) % this._activeSounds.length;

    const prevSource = sound.source;
    if (prevSource) {
      prevSource.stop();
    }
    sound.source = new AudioBufferSourceNode(this.context);
    sound.source.connect(sound.panner);
    sound.source.buffer = buffer;

    sound.rate = options?.rate ?? 1;
    sound.source.playbackRate.value = sound.rate * this._rate;
    sound.priority = options?.priority ?? 0;
    sound.mute.gain.value = (options?.mute ?? false) ? 0 : 1;
    sound.volume.gain.value = options?.volume ?? 1;
    sound.panner.pan.value = options?.pan ?? 0;
    sound.loop = options?.loop ?? false;
    sound.ended = false;

    const start = options?.start ?? 0;
    const offset = options?.offset ?? 0;
    const duration = (options?.end ?? buffer.duration) - start;

    const onEnded = e => {
      const prevSource = sound.source;
      if (prevSource !== e.target) {
        return;
      }
      prevSource.disconnect();
      prevSource.removeEventListener('ended', onEnded);
      if (sound.loop) {
        sound.source = new AudioBufferSourceNode(this.context);
        sound.source.buffer = prevSource.buffer;
        sound.source.connect(sound.panner);
        sound.source.addEventListener('ended', onEnded);
        sound.source.start(0, start, duration);
      } else {
        sound.ended = true;
        this._idToIndex.delete(sound.id);
        sound.id = -1;
      }
    };
    sound.source.addEventListener('ended', onEnded);

    sound.source.start(0, start + offset, duration - offset);

    this._idToIndex.delete(sound.id);
    this._idToIndex.set(id, index);
    sound.id = id;

    return id;
  }
}
