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
  // Optional: a profile without a Platform account provider simply has no balance.
  let accountService = null;
  try {
    root.inject(['deepseekAccount'], (ctx) => {
      accountService = ctx.deepseekAccount;
      return () => { accountService = null; };
    });
  } catch {
    /* no account service: the readout reports 'unavailable' */
  }

  let balanceCache = { at: 0, body: null };
  const BALANCE_CACHE_MS = 30000;

  const sendJson = (response, status, body) => {
    const text = JSON.stringify(body);
    response.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': String(Buffer.byteLength(text)),
      'cache-control': 'no-store',
    });
    response.end(text);
  };

  const handleBalance = async (request, response) => {
    const account = accountService;
    if (account === null || typeof account.getBalance !== 'function') {
      sendJson(response, 200, { ok: false, reason: 'unavailable' });
      return;
    }
    const now = Date.now();
    if (balanceCache.body !== null && now - balanceCache.at < BALANCE_CACHE_MS) {
      sendJson(response, 200, balanceCache.body);
      return;
    }
    const locale = typeof request.headers['accept-language'] === 'string'
      ? request.headers['accept-language'].split(',')[0].trim()
      : 'zh-CN';
    try {
      const value = await account.getBalance({
        version: '0.1.4',
        locale,
        timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
      });
      const body = value === null || value === undefined
        ? { ok: false, reason: 'signed-out' }
        : { ok: true, fetchedAt: now, balance: value };
      balanceCache = { at: now, body };
      sendJson(response, 200, body);
    } catch (error) {
      sendJson(response, 200, {
        ok: false,
        reason: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  root.inject(['webServer'], (ctx) => {
    const disposeBalance = ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-ayaka-theme/balance',
      handler: async (request, response) => {
        if (request.method !== 'GET') {
          response.writeHead(405, { allow: 'GET' });
          response.end();
          return;
        }
        await handleBalance(request, response);
      },
    });
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
    ctx.effect(() => disposeBalance);
  });
}
