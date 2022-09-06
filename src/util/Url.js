export function dirname(url) {
  return url.substring(0, url.lastIndexOf('/'));
}


export function basename(url) {
  return url.substring(url.lastIndexOf('/') + 1);
}


export function filename(url) {
  return basename(url).split('.')[0];
}
