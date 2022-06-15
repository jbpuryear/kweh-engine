export function image(url) {
  return fetch(url)
    .then(async res => {
      if (!res.ok) {
        throw new Error(`Network request failed: ${url}`);
      }
      const blob = await res.blob();
      const img = await createImageBitmap(blob);
      return img;
    });
}
