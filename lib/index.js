/**
 * dsh-ayaka-theme — host half.
 *
 * Serves the shipped assets (the motion wallpaper video, its poster frame and
 * the eleven sticker WebPs) from one prefix route. Everything visual lives in
 * the client half (`lib/client.js`), which references these URLs directly.
 */

import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ASSETS_ROOT = join(PACKAGE_ROOT, 'assets');
const ROUTE_PREFIX = '/dsh-ayaka-theme/assets';

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.webp': 'image/webp',
};

/** Reject anything that resolves outside assets/ (traversal, absolute paths, dotfiles). */
function resolveAssetPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const relative = normalize(decoded).replace(/^([/\\])+/, '');
  if (relative === '' || relative.split(/[/\\]/).some((part) => part === '..' || part.startsWith('.'))) return null;
  const absolute = resolve(ASSETS_ROOT, relative);
  return absolute.startsWith(resolve(ASSETS_ROOT) + sep) ? absolute : null;
}

export function apply(root) {
  root.inject(['webServer'], (ctx) => {
    const dispose = ctx.webServer.register({
      kind: 'prefix',
      path: ROUTE_PREFIX,
      handler: async (request, response) => {
        const pathname = new URL(request.url ?? '/', 'http://dsh.invalid').pathname;
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          response.writeHead(405, { allow: 'GET, HEAD' });
          response.end();
          return;
        }
        const target = resolveAssetPath(pathname.slice(ROUTE_PREFIX.length));
        if (target === null || !existsSync(target) || !(await stat(target)).isFile()) {
          response.writeHead(404, { 'cache-control': 'no-store' });
          response.end();
          return;
        }
        let body;
        try {
          body = await readFile(target);
        } catch {
          response.writeHead(404, { 'cache-control': 'no-store' });
          response.end();
          return;
        }
        const isVideo = extname(target).toLowerCase() === '.mp4';
        response.writeHead(200, {
          'content-type': CONTENT_TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream',
          'content-length': String(body.byteLength),
          'cache-control': isVideo ? 'public, max-age=3600' : 'no-cache',
          ...(isVideo ? { 'accept-ranges': 'bytes' } : {}),
        });
        response.end(request.method === 'HEAD' ? undefined : body);
      },
    });
    ctx.effect(() => dispose);
  });
}
