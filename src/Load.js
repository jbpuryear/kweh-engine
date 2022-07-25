export async function image(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Network request failed: ${url}`);
  }
  const blob = await res.blob();
  return createImageBitmap(blob);
}


export async function json(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Network request failed: ${url}`);
  }
  return res.json();
}
