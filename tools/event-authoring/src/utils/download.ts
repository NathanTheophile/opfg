const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
};

export const downloadBlob = (filename: string, blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const downloadText = (filename: string, content: string, mime = 'application/json;charset=utf-8'): void =>
  downloadBlob(filename, new Blob([content], { type: mime }));

export const downloadBytes = (filename: string, content: Uint8Array, mime = 'application/zip'): void =>
  downloadBlob(filename, new Blob([toArrayBuffer(content)], { type: mime }));
