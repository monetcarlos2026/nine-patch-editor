const http = require('http');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.join(__dirname, 'renderer');
const PORT = Number(process.env.PORT || 49390);
const AAPT_CANDIDATES = [
  '/Applications/mini-editor-pro.app/Contents/MacOS/aapt',
  '/opt/homebrew/bin/aapt',
  '/usr/local/bin/aapt'
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png'
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/compile') {
      await compileNinePatch(req, res);
      return;
    }

    if (req.method !== 'GET') {
      send(res, 405, 'Method Not Allowed', 'text/plain; charset=utf-8');
      return;
    }

    const pathname = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${PORT}`).pathname);
    const safePath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.normalize(path.join(ROOT, safePath));
    if (!filePath.startsWith(ROOT)) {
      send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
      return;
    }

    const body = await fs.readFile(filePath);
    send(res, 200, body, MIME[path.extname(filePath)] || 'application/octet-stream');
  } catch (error) {
    const status = req.method === 'POST' && req.url === '/api/compile' ? 500 : 404;
    send(res, status, String(error.message || error), 'text/plain; charset=utf-8');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Nine Patch Editor: http://127.0.0.1:${PORT}`);
});

async function compileNinePatch(req, res) {
  const payload = await readJson(req);
  const source = dataUrlToBuffer(payload.dataUrl);
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nine-patch-editor-'));
  const sourcePath = path.join(tmpDir, 'source.9.png');
  const outPath = path.join(tmpDir, 'compiled.9.png');
  await fs.writeFile(sourcePath, source);

  const aapt = await findAapt();
  if (!aapt) throw new Error('未找到 aapt，无法导出编译版。');

  await execFilePromise(aapt, ['singleCrunch', '-i', sourcePath, '-o', outPath]);
  const compiled = await fs.readFile(outPath);
  const defaultName = payload.defaultName || 'asset.9.png';
  const localPath = payload.savePath || await chooseSavePath(defaultName);
  if (!localPath) throw new Error('已取消保存。');
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, compiled);
  sendJson(res, {
    defaultName,
    localPath,
    hasNpTc: hasPngChunk(compiled, 'npTc'),
    hasNpOl: hasPngChunk(compiled, 'npOl')
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function findAapt() {
  for (const candidate of AAPT_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Continue probing known locations.
    }
  }
  return null;
}

function execFilePromise(file, args, timeout = 30000) {
  return new Promise((resolve, reject) => {
    execFile(file, args, { timeout }, (error, stdout, stderr) => {
      if (error) {
        error.message = `${error.message}\n${stderr || stdout}`;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function dataUrlToBuffer(dataUrl) {
  const encoded = String(dataUrl).replace(/^data:image\/png;base64,/, '');
  return Buffer.from(encoded, 'base64');
}

function hasPngChunk(buf, chunkType) {
  let offset = 8;
  while (offset + 12 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    if (type === chunkType) return true;
    offset += 12 + length;
  }
  return false;
}

function uniqueExportName(name) {
  const safe = path.basename(String(name)).replace(/[\\/:*?"<>|]/g, '_') || 'asset.9.png';
  const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  return safe.replace(/\.png$/i, `-${stamp}.png`);
}

async function chooseSavePath(defaultName) {
  if (process.platform !== 'darwin') {
    const exportDir = path.join(__dirname, 'exports');
    return path.join(exportDir, uniqueExportName(defaultName));
  }

  const script = [
    'set saveFile to choose file name with prompt "保存编译后的 .9.png" default name ' + JSON.stringify(defaultName),
    'POSIX path of saveFile'
  ];
  try {
    const { stdout } = await execFilePromise('/usr/bin/osascript', script.flatMap((line) => ['-e', line]), 0);
    return stdout.trim();
  } catch (error) {
    if (String(error.message || '').includes('User canceled')) return null;
    throw error;
  }
}

function sendJson(res, body) {
  send(res, 200, JSON.stringify(body), 'application/json; charset=utf-8');
}

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store'
  });
  res.end(body);
}
