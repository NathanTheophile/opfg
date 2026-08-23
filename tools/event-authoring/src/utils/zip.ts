const te = new TextEncoder();
const td = new TextDecoder();
const u16 = (v: DataView, o: number) => v.getUint16(o, true);
const u32 = (v: DataView, o: number) => v.getUint32(o, true);

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();
const crc32 = (bytes: Uint8Array): number => {
  let c = 0xffffffff;
  for (const byte of bytes) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const concat = (chunks: Uint8Array[]): Uint8Array => {
  const total = chunks.reduce((sum, x) => sum + x.length, 0); const out = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.length; }
  return out;
};
const header = (size: number): { bytes: Uint8Array; view: DataView } => { const bytes = new Uint8Array(size); return { bytes, view: new DataView(bytes.buffer) }; };

export interface ZipEntryInput { path: string; data: string | Uint8Array; }
export const createZip = (entries: ZipEntryInput[]): Uint8Array => {
  const locals: Uint8Array[] = []; const centrals: Uint8Array[] = []; let offset = 0;
  for (const entry of entries) {
    const name = te.encode(entry.path.replace(/\\/g, '/')); const data = typeof entry.data === 'string' ? te.encode(entry.data) : entry.data; const crc = crc32(data);
    const local = header(30 + name.length); local.view.setUint32(0, 0x04034b50, true); local.view.setUint16(4, 20, true); local.view.setUint16(6, 0x0800, true); local.view.setUint16(8, 0, true); local.view.setUint32(14, crc, true); local.view.setUint32(18, data.length, true); local.view.setUint32(22, data.length, true); local.view.setUint16(26, name.length, true); local.bytes.set(name, 30);
    locals.push(local.bytes, data);
    const central = header(46 + name.length); central.view.setUint32(0, 0x02014b50, true); central.view.setUint16(4, 20, true); central.view.setUint16(6, 20, true); central.view.setUint16(8, 0x0800, true); central.view.setUint16(10, 0, true); central.view.setUint32(16, crc, true); central.view.setUint32(20, data.length, true); central.view.setUint32(24, data.length, true); central.view.setUint16(28, name.length, true); central.view.setUint32(42, offset, true); central.bytes.set(name, 46); centrals.push(central.bytes);
    offset += local.bytes.length + data.length;
  }
  const centralOffset = offset; const centralSize = centrals.reduce((sum, x) => sum + x.length, 0);
  const eocd = header(22); eocd.view.setUint32(0, 0x06054b50, true); eocd.view.setUint16(8, entries.length, true); eocd.view.setUint16(10, entries.length, true); eocd.view.setUint32(12, centralSize, true); eocd.view.setUint32(16, centralOffset, true);
  return concat([...locals, ...centrals, eocd.bytes]);
};

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
};

const inflateRaw = async (bytes: Uint8Array): Promise<Uint8Array> => {
  if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot decompress DEFLATE ZIP entries.');
  const stream = new Blob([toArrayBuffer(bytes)]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

export const readZip = async (input: ArrayBuffer | Uint8Array): Promise<Map<string, Uint8Array>> => {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input); const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i -= 1) if (u32(view, i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Invalid ZIP: end-of-central-directory not found.');
  const count = u16(view, eocd + 10); let cursor = u32(view, eocd + 16); const result = new Map<string, Uint8Array>();
  for (let i = 0; i < count; i += 1) {
    if (u32(view, cursor) !== 0x02014b50) throw new Error('Invalid ZIP central directory.');
    const method = u16(view, cursor + 10); const compressedSize = u32(view, cursor + 20); const nameLen = u16(view, cursor + 28); const extraLen = u16(view, cursor + 30); const commentLen = u16(view, cursor + 32); const localOffset = u32(view, cursor + 42);
    const name = td.decode(bytes.slice(cursor + 46, cursor + 46 + nameLen)); cursor += 46 + nameLen + extraLen + commentLen;
    if (name.endsWith('/')) continue;
    if (u32(view, localOffset) !== 0x04034b50) throw new Error(`Invalid ZIP local header for ${name}.`);
    const localNameLen = u16(view, localOffset + 26); const localExtraLen = u16(view, localOffset + 28); const dataStart = localOffset + 30 + localNameLen + localExtraLen; const compressed = bytes.slice(dataStart, dataStart + compressedSize);
    const data = method === 0 ? compressed : method === 8 ? await inflateRaw(compressed) : (() => { throw new Error(`Unsupported ZIP compression method ${method} for ${name}.`); })();
    result.set(name.replace(/\\/g, '/'), data);
  }
  return result;
};

export const zipText = (entries: Map<string, Uint8Array>, path: string): string | undefined => { const value = entries.get(path); return value ? td.decode(value) : undefined; };

