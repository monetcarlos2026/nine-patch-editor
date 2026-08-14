const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const AAPT_CANDIDATES = [
  '/Applications/mini-editor-pro.app/Contents/MacOS/aapt',
  '/opt/homebrew/bin/aapt',
  '/usr/local/bin/aapt'
];

function createWindow() {
  const win = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    title: '点九编辑器',
    backgroundColor: '#202226',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('open-image', async () => {
  const result = await dialog.showOpenDialog({
    title: '打开 .9.png',
    properties: ['openFile'],
    filters: [
      { name: 'PNG / Nine-patch', extensions: ['png'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return readImageFile(result.filePaths[0]);
});

ipcMain.handle('read-dropped-file', async (_event, filePath) => readImageFile(filePath));

ipcMain.handle('save-source', async (_event, payload) => {
  const target = await askSavePath(payload.defaultName || 'asset.9.png');
  if (!target) return null;
  await fs.writeFile(target, dataUrlToBuffer(payload.dataUrl));
  return { path: target };
});

ipcMain.handle('save-compiled', async (_event, payload) => {
  const target = await askSavePath(payload.defaultName || 'asset.9.png');
  if (!target) return null;

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nine-patch-editor-'));
  const sourcePath = path.join(tmpDir, 'source.9.png');
  const outPath = path.join(tmpDir, 'compiled.9.png');
  await fs.writeFile(sourcePath, dataUrlToBuffer(payload.dataUrl));

  const aaptPath = await findAapt();
  if (!aaptPath) {
    throw new Error('未找到 aapt。请安装 Android build tools，或保留 /Applications/mini-editor-pro.app/Contents/MacOS/aapt。');
  }

  await execFilePromise(aaptPath, ['singleCrunch', '-i', sourcePath, '-o', outPath]);
  const compiled = await fs.readFile(outPath);
  await fs.writeFile(target, compiled);

  return {
    path: target,
    hasNpTc: hasPngChunk(compiled, 'npTc'),
    hasNpOl: hasPngChunk(compiled, 'npOl')
  };
});

async function readImageFile(filePath) {
  const buf = await fs.readFile(filePath);
  return {
    path: filePath,
    name: path.basename(filePath),
    dataUrl: `data:image/png;base64,${buf.toString('base64')}`,
    hasNpTc: hasPngChunk(buf, 'npTc'),
    hasNpOl: hasPngChunk(buf, 'npOl')
  };
}

async function askSavePath(defaultName) {
  const result = await dialog.showSaveDialog({
    title: '保存 .9.png',
    defaultPath: defaultName,
    filters: [{ name: 'Nine-patch PNG', extensions: ['png'] }]
  });
  return result.canceled ? null : result.filePath;
}

function dataUrlToBuffer(dataUrl) {
  const encoded = String(dataUrl).replace(/^data:image\/png;base64,/, '');
  return Buffer.from(encoded, 'base64');
}

async function findAapt() {
  for (const candidate of AAPT_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next known location.
    }
  }
  return null;
}

function execFilePromise(file, args) {
  return new Promise((resolve, reject) => {
    execFile(file, args, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        error.message = `${error.message}\n${stderr || stdout}`;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function hasPngChunk(buf, chunkType) {
  if (!Buffer.isBuffer(buf) || buf.length < 16) return false;
  let offset = 8;
  while (offset + 12 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    if (type === chunkType) return true;
    offset += 12 + length;
  }
  return false;
}
