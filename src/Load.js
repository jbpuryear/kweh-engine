import Music from './audio/Music.js';
import Sound from './audio/Sound.js';


export async function image(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Network request failed: ${url}`);
  }
  const blob = await res.blob();
  return createImageBitmap(blob, {premultiplyAlpha: 'none'});
}


export async function json(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Network request failed: ${url}`);
  }
  return res.json();
}


export async function music(url, audio) {
  return new Promise((res, rej) => {
    const elem = document.createElement('video');
    elem.src = url;
    const song = new Music(audio, elem);
    let errCallback;
    let loadCallback;
    errCallback = (e) => {
      elem.removeEventListener('error', errCallback);
      elem.removeEventListener('canplaythrough', loadCallback);
      rej(e);
    }
    loadCallback = () => {
      elem.removeEventListener('error', errCallback);
      elem.removeEventListener('canplaythrough', loadCallback);
      res(song);
    }
    elem.addEventListener('error', errCallback);
    elem.addEventListener('canplaythrough', loadCallback);
  })
}


export async function sound(url, audio) {
  const file = await fetch(url);
  const encoded = await file.arrayBuffer();
  const buffer = await audio.context.decodeAudioData(encoded);
  return new Sound(audio, buffer);
}
