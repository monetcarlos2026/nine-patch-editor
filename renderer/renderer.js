const state = {
  fileName: '',
  filePath: '',
  img: null,
  hasNineBorder: false,
  hasNpTc: false,
  autoPreparedNinePatch: false,
  contentCanvas: null,
  locale: localStorage.getItem('ninePatchLocale') || 'zh-CN',
  tool: 'stretchX',
  ranges: {
    stretchX: [0, 1],
    stretchY: [0, 1],
    contentX: [0, 1],
    contentY: [0, 1]
  },
  initial: null,
  undoStack: [],
  pendingUndo: null,
  dragging: null,
  view: {
    scale: 1,
    originX: 0,
    originY: 0,
    imageW: 0,
    imageH: 0
  }
};

if (!window.ninePatch) {
  window.ninePatch = createBrowserBridge();
}

const I18N = {
  'zh-CN': {
    appTitle: '点九编辑器',
    noFile: '未打开文件',
    open: '打开',
    reset: '复位',
    source: '源图',
    compile: '编译',
    compiling: '编译中',
    openTitle: '打开 PNG',
    resetTitle: '恢复到打开文件时的初始区域',
    sourceTitle: '导出带 1px 引导边框的源图',
    compileTitle: '调用 aapt singleCrunch 导出编译版',
    tools: '工具',
    pixelRanges: '像素范围',
    copyParams: '复制参数',
    previewSize: '预览尺寸',
    width: '宽',
    height: '高',
    showContent: '显示内容区域',
    status: '状态',
    waitingOpen: '等待打开 PNG',
    livePreview: '实时预览',
    stretchX: '水平拉伸',
    stretchY: '垂直拉伸',
    contentX: '内容宽度',
    contentY: '内容高度',
    noReset: '没有可复位的图片',
    resetDone: '已恢复到打开文件时的初始区域',
    noExport: '没有可导出的图片',
    noCopy: '没有可复制的参数',
    sourceExported: '已导出源图: {path}',
    compileStart: '正在调用 aapt singleCrunch...',
    compileDone: '已导出编译版: {path}\n{chunks}',
    compileFailed: '编译失败: {message}',
    npTcWritten: 'npTc 已写入',
    npTcMissing: '未检测到 npTc',
    borderDetected: '边框: 已检测',
    borderPrepared: '边框: 已预编译',
    borderNew: '边框: 新建',
    borderUnchecked: '边框: 未检测',
    chunkDetected: 'npTc: 已检测',
    chunkMissing: 'npTc: 未检测',
    autoPrepared: '普通 PNG 已自动预编译为源图 {name}',
    compiledDetected: '检测到编译版 npTc；当前会按普通图重新建立引导线。',
    fileOpened: '文件已打开',
    emptyTitle: '打开或拖入 PNG',
    emptySubtitle: '支持源图 .9.png；普通 PNG 会自动预编译为源图',
    fileModeCompile: '当前是直接打开 HTML 文件，浏览器不能调用本地 aapt。请双击“打开点九编辑器.command”或运行 node server.js 后用 http://127.0.0.1:49390/ 打开。',
    noUndo: '没有可撤销的操作',
    undoDone: '已撤销上一步操作',
    paramsCopied: '参数已复制',
    clipboardFailed: '复制失败: {message}',
    paramsHeader: 'Nine-patch parameters'
  },
  en: {
    appTitle: 'Nine-Patch Editor',
    noFile: 'No file opened',
    open: 'Open',
    reset: 'Reset',
    source: 'Source',
    compile: 'Compile',
    compiling: 'Compiling',
    openTitle: 'Open PNG',
    resetTitle: 'Restore the initial regions from file open',
    sourceTitle: 'Export source with 1px guide border',
    compileTitle: 'Compile with aapt singleCrunch',
    tools: 'Tools',
    pixelRanges: 'Pixel Ranges',
    copyParams: 'Copy Params',
    previewSize: 'Preview Size',
    width: 'W',
    height: 'H',
    showContent: 'Show content area',
    status: 'Status',
    waitingOpen: 'Waiting for PNG',
    livePreview: 'Live Preview',
    stretchX: 'Horizontal stretch',
    stretchY: 'Vertical stretch',
    contentX: 'Content width',
    contentY: 'Content height',
    noReset: 'No image to reset',
    resetDone: 'Restored to the initial regions',
    noExport: 'No image to export',
    noCopy: 'No parameters to copy',
    sourceExported: 'Source exported: {path}',
    compileStart: 'Running aapt singleCrunch...',
    compileDone: 'Compiled image exported: {path}\n{chunks}',
    compileFailed: 'Compile failed: {message}',
    npTcWritten: 'npTc written',
    npTcMissing: 'npTc not detected',
    borderDetected: 'Border: detected',
    borderPrepared: 'Border: prepared',
    borderNew: 'Border: new',
    borderUnchecked: 'Border: unchecked',
    chunkDetected: 'npTc: detected',
    chunkMissing: 'npTc: not detected',
    autoPrepared: 'Plain PNG prepared as source {name}',
    compiledDetected: 'Compiled npTc detected; regions will be rebuilt from the image.',
    fileOpened: 'File opened',
    emptyTitle: 'Open or drop PNG',
    emptySubtitle: 'Supports .9.png source; plain PNG is prepared automatically',
    fileModeCompile: 'This page was opened as a local HTML file, so the browser cannot call local aapt. Use "打开点九编辑器.command" or run node server.js and open http://127.0.0.1:49390/.',
    noUndo: 'Nothing to undo',
    undoDone: 'Undid the last operation',
    paramsCopied: 'Parameters copied',
    clipboardFailed: 'Copy failed: {message}',
    paramsHeader: 'Nine-patch parameters'
  },
  ja: {
    appTitle: 'Nine-Patch エディタ',
    noFile: 'ファイル未選択',
    open: '開く',
    reset: 'リセット',
    source: 'ソース',
    compile: 'コンパイル',
    compiling: '処理中',
    openTitle: 'PNG を開く',
    resetTitle: '読み込み時の初期領域に戻す',
    sourceTitle: '1px ガイド付きソースを書き出す',
    compileTitle: 'aapt singleCrunch でコンパイル',
    tools: 'ツール',
    pixelRanges: 'ピクセル範囲',
    copyParams: 'パラメータコピー',
    previewSize: 'プレビューサイズ',
    width: '幅',
    height: '高さ',
    showContent: 'コンテンツ領域を表示',
    status: '状態',
    waitingOpen: 'PNG 待機中',
    livePreview: 'ライブプレビュー',
    stretchX: '横伸縮',
    stretchY: '縦伸縮',
    contentX: '内容幅',
    contentY: '内容高さ',
    noReset: 'リセットする画像がありません',
    resetDone: '初期領域に戻しました',
    noExport: '書き出す画像がありません',
    noCopy: 'コピーするパラメータがありません',
    sourceExported: 'ソースを書き出しました: {path}',
    compileStart: 'aapt singleCrunch を実行中...',
    compileDone: 'コンパイル済み画像を書き出しました: {path}\n{chunks}',
    compileFailed: 'コンパイル失敗: {message}',
    npTcWritten: 'npTc 書き込み済み',
    npTcMissing: 'npTc 未検出',
    borderDetected: '境界: 検出済み',
    borderPrepared: '境界: 準備済み',
    borderNew: '境界: 新規',
    borderUnchecked: '境界: 未確認',
    chunkDetected: 'npTc: 検出済み',
    chunkMissing: 'npTc: 未検出',
    autoPrepared: '通常 PNG をソース {name} として準備しました',
    compiledDetected: 'コンパイル済み npTc を検出しました。画像から領域を再作成します。',
    fileOpened: 'ファイルを開きました',
    emptyTitle: 'PNG を開くかドロップ',
    emptySubtitle: '.9.png ソース対応。通常 PNG は自動準備されます',
    fileModeCompile: 'HTML ファイルを直接開いているため、ブラウザからローカル aapt を呼び出せません。command 起動器または node server.js で http://127.0.0.1:49390/ を開いてください。',
    noUndo: '取り消す操作がありません',
    undoDone: '直前の操作を取り消しました',
    paramsCopied: 'パラメータをコピーしました',
    clipboardFailed: 'コピー失敗: {message}',
    paramsHeader: 'Nine-patch parameters'
  },
  ko: {
    appTitle: '나인패치 편집기',
    noFile: '파일 없음',
    open: '열기',
    reset: '초기화',
    source: '원본',
    compile: '컴파일',
    compiling: '컴파일 중',
    openTitle: 'PNG 열기',
    resetTitle: '파일을 열었을 때의 초기 영역으로 복원',
    sourceTitle: '1px 가이드 테두리가 있는 원본 내보내기',
    compileTitle: 'aapt singleCrunch로 컴파일',
    tools: '도구',
    pixelRanges: '픽셀 범위',
    copyParams: '파라미터 복사',
    previewSize: '미리보기 크기',
    width: '너비',
    height: '높이',
    showContent: '내용 영역 표시',
    status: '상태',
    waitingOpen: 'PNG 대기 중',
    livePreview: '실시간 미리보기',
    stretchX: '가로 늘림',
    stretchY: '세로 늘림',
    contentX: '내용 너비',
    contentY: '내용 높이',
    noReset: '초기화할 이미지가 없습니다',
    resetDone: '초기 영역으로 복원했습니다',
    noExport: '내보낼 이미지가 없습니다',
    noCopy: '복사할 파라미터가 없습니다',
    sourceExported: '원본 내보냄: {path}',
    compileStart: 'aapt singleCrunch 실행 중...',
    compileDone: '컴파일된 이미지 내보냄: {path}\n{chunks}',
    compileFailed: '컴파일 실패: {message}',
    npTcWritten: 'npTc 기록됨',
    npTcMissing: 'npTc 감지 안 됨',
    borderDetected: '테두리: 감지됨',
    borderPrepared: '테두리: 준비됨',
    borderNew: '테두리: 새로 생성',
    borderUnchecked: '테두리: 미확인',
    chunkDetected: 'npTc: 감지됨',
    chunkMissing: 'npTc: 감지 안 됨',
    autoPrepared: '일반 PNG를 원본 {name}(으)로 준비했습니다',
    compiledDetected: '컴파일된 npTc가 감지되어 이미지 기준으로 영역을 다시 만듭니다.',
    fileOpened: '파일을 열었습니다',
    emptyTitle: 'PNG 열기 또는 드롭',
    emptySubtitle: '.9.png 원본 지원, 일반 PNG는 자동 준비됩니다',
    fileModeCompile: 'HTML 파일을 직접 열었기 때문에 브라우저가 로컬 aapt를 호출할 수 없습니다. command 실행기 또는 node server.js로 http://127.0.0.1:49390/ 을 여세요.',
    noUndo: '실행 취소할 작업이 없습니다',
    undoDone: '마지막 작업을 취소했습니다',
    paramsCopied: '파라미터를 복사했습니다',
    clipboardFailed: '복사 실패: {message}',
    paramsHeader: 'Nine-patch parameters'
  }
};

const editorCanvas = document.getElementById('editorCanvas');
const editorCtx = editorCanvas.getContext('2d');
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');
const dropZone = document.getElementById('dropZone');

const els = {
  fileInput: document.getElementById('fileInput'),
  languageSelect: document.getElementById('languageSelect'),
  openBtn: document.getElementById('openBtn'),
  resetBtn: document.getElementById('resetBtn'),
  copyParamsBtn: document.getElementById('copyParamsBtn'),
  exportSourceBtn: document.getElementById('exportSourceBtn'),
  exportCompiledBtn: document.getElementById('exportCompiledBtn'),
  fileMeta: document.getElementById('fileMeta'),
  statusText: document.getElementById('statusText'),
  borderBadge: document.getElementById('borderBadge'),
  chunkBadge: document.getElementById('chunkBadge'),
  previewW: document.getElementById('previewW'),
  previewH: document.getElementById('previewH'),
  previewWOut: document.getElementById('previewWOut'),
  previewHOut: document.getElementById('previewHOut'),
  showContent: document.getElementById('showContent')
};

const rangeInputs = {
  stretchX: [document.getElementById('stretchXStart'), document.getElementById('stretchXEnd')],
  stretchY: [document.getElementById('stretchYStart'), document.getElementById('stretchYEnd')],
  contentX: [document.getElementById('contentXStart'), document.getElementById('contentXEnd')],
  contentY: [document.getElementById('contentYStart'), document.getElementById('contentYEnd')]
};

els.fileInput.addEventListener('change', async () => {
  const file = els.fileInput.files?.[0];
  if (!file) return;
  await loadFile(await readBrowserFile(file));
  els.fileInput.value = '';
});

els.languageSelect.addEventListener('change', () => {
  state.locale = els.languageSelect.value;
  localStorage.setItem('ninePatchLocale', state.locale);
  applyLanguage();
  drawAll();
});

els.copyParamsBtn.addEventListener('click', async () => {
  if (!state.img) return setStatus(t('noCopy'));
  try {
    await copyText(buildParamsText());
    setStatus(t('paramsCopied'));
  } catch (error) {
    setStatus(t('clipboardFailed', { message: error.message }));
  }
});

els.resetBtn.addEventListener('click', () => {
  if (!state.img || !state.initial) return setStatus(t('noReset'));
  pushUndoSnapshot(captureEditorState());
  applyEditorState(state.initial);
  setStatus(t('resetDone'));
});

els.exportSourceBtn.addEventListener('click', async () => {
  if (!state.img) return setStatus(t('noExport'));
  try {
    const dataUrl = buildSourceNinePatch();
    const name = ensureNinePatchName(state.fileName || 'asset.png');
    const saved = await window.ninePatch.saveSource({ dataUrl, defaultName: name });
    if (saved) setStatus(t('sourceExported', { path: saved.path }));
  } catch (error) {
    setStatus(error.message);
  }
});

els.exportCompiledBtn.addEventListener('click', async () => {
  if (!state.img) return setStatus(t('noExport'));
  const originalLabel = els.exportCompiledBtn.textContent;
  try {
    els.exportCompiledBtn.disabled = true;
    els.exportCompiledBtn.textContent = t('compiling');
    setStatus(t('compileStart'));
    const dataUrl = buildSourceNinePatch();
    const name = ensureNinePatchName(state.fileName || 'asset.png');
    const saved = await window.ninePatch.saveCompiled({ dataUrl, defaultName: name });
    if (saved) {
      const chunks = saved.hasNpTc ? t('npTcWritten') : t('npTcMissing');
      const savedPath = saved.localPath || saved.path;
      setStatus(t('compileDone', { path: savedPath, chunks }));
    }
  } catch (error) {
    setStatus(t('compileFailed', { message: error.message }));
  } finally {
    els.exportCompiledBtn.disabled = false;
    els.exportCompiledBtn.textContent = originalLabel;
  }
});

document.querySelectorAll('.mode-button').forEach((button) => {
  button.addEventListener('click', () => {
    state.tool = button.dataset.tool;
    document.querySelectorAll('.mode-button').forEach((b) => b.classList.toggle('active', b === button));
    drawAll();
  });
});

Object.entries(rangeInputs).forEach(([key, inputs]) => {
  inputs.forEach((input, index) => {
    input.addEventListener('focus', beginUndoCapture);
    input.addEventListener('pointerdown', beginUndoCapture);
    input.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
        beginUndoCapture();
      }
    });
    input.addEventListener('change', () => {
      const max = key.endsWith('X') ? contentW() : contentH();
      const next = [...state.ranges[key]];
      next[index] = Number(input.value);
      state.ranges[key] = clampRange(next, max);
      commitUndoCapture();
      syncRangeInputs();
      drawAll();
    });
  });
});

[els.previewW, els.previewH, els.showContent].forEach((input) => {
  input.addEventListener('focus', beginUndoCapture);
  input.addEventListener('pointerdown', beginUndoCapture);
  input.addEventListener('keydown', beginUndoCapture);
  input.addEventListener('change', commitUndoCapture);
  input.addEventListener('input', drawAll);
});

window.addEventListener('resize', resizeCanvases);
window.addEventListener('keydown', (event) => {
  const isUndo = (event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'z';
  if (!isUndo) return;
  event.preventDefault();
  undoLastOperation();
});

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('dragging');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragging');
});

dropZone.addEventListener('drop', async (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragging');
  const file = event.dataTransfer.files?.[0];
  if (!file) return;
  const loaded = file.path
    ? await window.ninePatch.readDroppedFile(file.path)
    : await readBrowserFile(file);
  await loadFile(loaded);
});

editorCanvas.addEventListener('pointerdown', (event) => {
  if (!state.img) return;
  const point = eventToContentPoint(event);
  if (!point) return;
  editorCanvas.setPointerCapture(event.pointerId);
  state.dragging = { start: point, current: point, undo: captureEditorState() };
  updateRangeFromDrag();
});

editorCanvas.addEventListener('pointermove', (event) => {
  if (!state.dragging) return;
  const point = eventToContentPoint(event);
  if (!point) return;
  state.dragging.current = point;
  updateRangeFromDrag();
});

editorCanvas.addEventListener('pointerup', () => {
  if (state.dragging) commitUndoSnapshot(state.dragging.undo);
  state.dragging = null;
});

async function loadFile(file) {
  const img = await loadImage(file.dataUrl);
  const sourceHasBorder = detectNinePatchBorder(img);
  const autoPrepared = !sourceHasBorder && !file.hasNpTc && !isNinePatchName(file.name);
  state.fileName = autoPrepared ? ensureNinePatchName(file.name) : file.name;
  state.filePath = file.path;
  state.img = img;
  state.hasNpTc = file.hasNpTc;
  state.hasNineBorder = sourceHasBorder;
  state.autoPreparedNinePatch = autoPrepared;
  state.contentCanvas = extractContentCanvas(img, state.hasNineBorder);
  state.ranges = detectRanges(img, state.hasNineBorder);
  state.undoStack = [];
  state.pendingUndo = null;

  const w = contentW();
  const h = contentH();
  els.previewW.max = Math.max(900, w * 3);
  els.previewH.max = Math.max(900, h * 3);
  els.previewW.value = Math.max(w, 160);
  els.previewH.value = Math.max(h, 160);
  els.showContent.checked = false;
  state.initial = {
    ranges: cloneRanges(state.ranges),
    previewW: els.previewW.value,
    previewH: els.previewH.value,
    showContent: els.showContent.checked
  };

  const outputName = autoPrepared ? ` -> ${state.fileName}` : '';
  els.fileMeta.textContent = `${file.name}${outputName}  ·  ${img.width} x ${img.height} px`;
  els.borderBadge.textContent = state.hasNineBorder
    ? t('borderDetected')
    : state.autoPreparedNinePatch
      ? t('borderPrepared')
      : t('borderNew');
  els.chunkBadge.textContent = state.hasNpTc ? t('chunkDetected') : t('chunkMissing');
  const status = state.autoPreparedNinePatch
    ? t('autoPrepared', { name: state.fileName })
    : state.hasNpTc && !state.hasNineBorder
      ? t('compiledDetected')
      : t('fileOpened');
  setStatus(status);
  syncRangeInputs();
  resizeCanvases();
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function resizeCanvases() {
  const rect = dropZone.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  editorCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
  editorCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
  editorCanvas.style.width = `${rect.width}px`;
  editorCanvas.style.height = `${rect.height}px`;
  editorCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawAll();
}

function drawAll() {
  drawEditor();
  drawPreview();
}

function drawEditor() {
  const rect = dropZone.getBoundingClientRect();
  editorCtx.clearRect(0, 0, rect.width, rect.height);
  drawEmptyState(rect);
  if (!state.img) return;

  const imageW = contentW();
  const imageH = contentH();
  const padding = 66;
  const scale = Math.min((rect.width - padding * 2) / imageW, (rect.height - padding * 2) / imageH, 2.8);
  const drawW = imageW * scale;
  const drawH = imageH * scale;
  const x = (rect.width - drawW) / 2;
  const y = (rect.height - drawH) / 2;
  state.view = { scale, originX: x, originY: y, imageW, imageH };

  drawChecker(editorCtx, x, y, drawW, drawH, Math.max(6, 12 * scale));
  editorCtx.drawImage(state.contentCanvas, x, y, drawW, drawH);

  drawRulers(editorCtx, x, y, drawW, drawH, imageW, imageH, scale);
  drawGuides(editorCtx, x, y, scale, true);
}

function drawEmptyState(rect) {
  if (state.img) return;
  editorCtx.fillStyle = '#c3c7cf';
  editorCtx.font = '600 18px -apple-system, BlinkMacSystemFont, "PingFang SC"';
  editorCtx.textAlign = 'center';
  editorCtx.fillText(t('emptyTitle'), rect.width / 2, rect.height / 2 - 8);
  editorCtx.font = '13px -apple-system, BlinkMacSystemFont, "PingFang SC"';
  editorCtx.fillStyle = '#969da8';
  editorCtx.fillText(t('emptySubtitle'), rect.width / 2, rect.height / 2 + 18);
}

function drawGuides(ctx, x, y, scale, labels) {
  const w = contentW();
  const h = contentH();
  const sx = state.ranges.stretchX;
  const sy = state.ranges.stretchY;
  const cx = state.ranges.contentX;
  const cy = state.ranges.contentY;

  ctx.save();
  ctx.lineCap = 'butt';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#2c8df0';
  drawLine(ctx, x + sx[0] * scale, y - 10, x + sx[1] * scale, y - 10);
  drawLine(ctx, x - 10, y + sy[0] * scale, x - 10, y + sy[1] * scale);

  ctx.strokeStyle = '#43b26d';
  drawLine(ctx, x + cx[0] * scale, y + h * scale + 10, x + cx[1] * scale, y + h * scale + 10);
  drawLine(ctx, x + w * scale + 10, y + cy[0] * scale, x + w * scale + 10, y + cy[1] * scale);

  if (els.showContent.checked) {
    ctx.fillStyle = 'rgba(67, 178, 109, .18)';
    ctx.fillRect(x + cx[0] * scale, y + cy[0] * scale, (cx[1] - cx[0]) * scale, (cy[1] - cy[0]) * scale);
  }

  if (labels) {
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "PingFang SC"';
    ctx.fillStyle = state.tool.startsWith('stretch') ? '#9bcfff' : '#9fe0b7';
    const label = toolLabel(state.tool);
    ctx.fillText(label, x + 4, y - 46);
  }
  ctx.restore();
}

function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawRulers(ctx, x, y, drawW, drawH, imageW, imageH, scale) {
  const majorStep = chooseRulerStep(scale);
  const minorStep = Math.max(1, majorStep / 5);
  const rulerGap = 24;
  const major = 9;
  const minor = 5;

  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(225, 232, 240, .56)';
  ctx.fillStyle = 'rgba(225, 232, 240, .82)';
  ctx.font = '10px -apple-system, BlinkMacSystemFont, "PingFang SC"';
  ctx.textBaseline = 'middle';

  drawLine(ctx, x, y - rulerGap, x + drawW, y - rulerGap);
  drawLine(ctx, x, y + drawH + rulerGap, x + drawW, y + drawH + rulerGap);
  drawLine(ctx, x - rulerGap, y, x - rulerGap, y + drawH);
  drawLine(ctx, x + drawW + rulerGap, y, x + drawW + rulerGap, y + drawH);

  for (let px = 0; px <= imageW; px += minorStep) {
    const screenX = x + px * scale;
    const isMajor = px % majorStep === 0 || px === imageW;
    const len = isMajor ? major : minor;
    drawLine(ctx, screenX, y - rulerGap, screenX, y - rulerGap + len);
    drawLine(ctx, screenX, y + drawH + rulerGap, screenX, y + drawH + rulerGap - len);
    if (isMajor) {
      ctx.textAlign = 'center';
      ctx.fillText(String(px), screenX, y - rulerGap - 9);
      ctx.fillText(String(px), screenX, y + drawH + rulerGap + 9);
    }
  }

  for (let py = 0; py <= imageH; py += minorStep) {
    const screenY = y + py * scale;
    const isMajor = py % majorStep === 0 || py === imageH;
    const len = isMajor ? major : minor;
    drawLine(ctx, x - rulerGap, screenY, x - rulerGap + len, screenY);
    drawLine(ctx, x + drawW + rulerGap, screenY, x + drawW + rulerGap - len, screenY);
    if (isMajor) {
      ctx.textAlign = 'right';
      ctx.fillText(String(py), x - rulerGap - 6, screenY);
      ctx.textAlign = 'left';
      ctx.fillText(String(py), x + drawW + rulerGap + 6, screenY);
    }
  }

  ctx.restore();
}

function chooseRulerStep(scale) {
  if (scale >= 2.2) return 10;
  if (scale >= 1.1) return 20;
  if (scale >= .55) return 50;
  if (scale >= .28) return 100;
  return 200;
}

function drawPreview() {
  if (!state.img) {
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    return;
  }
  const targetW = Number(els.previewW.value);
  const targetH = Number(els.previewH.value);
  els.previewWOut.value = targetW;
  els.previewHOut.value = targetH;

  const host = document.querySelector('.preview-stage').getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const scale = Math.min((host.width - 28) / targetW, (host.height - 28) / targetH, 1);
  const cssW = Math.max(1, Math.round(targetW * scale));
  const cssH = Math.max(1, Math.round(targetH * scale));
  previewCanvas.style.width = `${cssW}px`;
  previewCanvas.style.height = `${cssH}px`;
  previewCanvas.width = Math.max(1, Math.floor(cssW * dpr));
  previewCanvas.height = Math.max(1, Math.floor(cssH * dpr));
  previewCtx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  previewCtx.clearRect(0, 0, targetW, targetH);

  renderNinePatch(previewCtx, targetW, targetH);
  if (els.showContent.checked) {
    const [x0, x1] = scaleRangeToTarget(state.ranges.contentX, contentW(), targetW, state.ranges.stretchX);
    const [y0, y1] = scaleRangeToTarget(state.ranges.contentY, contentH(), targetH, state.ranges.stretchY);
    previewCtx.fillStyle = 'rgba(67, 178, 109, .18)';
    previewCtx.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
}

function renderNinePatch(ctx, targetW, targetH) {
  const src = state.contentCanvas;
  const srcW = contentW();
  const srcH = contentH();
  const xCuts = makeCuts(srcW, targetW, state.ranges.stretchX);
  const yCuts = makeCuts(srcH, targetH, state.ranges.stretchY);

  for (const xs of xCuts) {
    for (const ys of yCuts) {
      if (xs.size <= 0 || ys.size <= 0 || xs.outSize <= 0 || ys.outSize <= 0) continue;
      ctx.drawImage(src, xs.source, ys.source, xs.size, ys.size, xs.dest, ys.dest, xs.outSize, ys.outSize);
    }
  }
}

function makeCuts(srcSize, targetSize, stretch) {
  const before = Math.max(0, stretch[0]);
  const stretchSize = Math.max(1, stretch[1] - stretch[0]);
  const after = Math.max(0, srcSize - stretch[1]);
  const fixed = before + after;
  const stretched = Math.max(1, targetSize - fixed);
  return [
    { source: 0, size: before, dest: 0, outSize: before },
    { source: stretch[0], size: stretchSize, dest: before, outSize: stretched },
    { source: stretch[1], size: after, dest: before + stretched, outSize: after }
  ];
}

function scaleRangeToTarget(range, srcSize, targetSize, stretch) {
  const cuts = makeCuts(srcSize, targetSize, stretch);
  const map = (value) => {
    let result = 0;
    for (const cut of cuts) {
      if (value <= cut.source) return cut.dest;
      if (value <= cut.source + cut.size) {
        const ratio = cut.size === 0 ? 0 : (value - cut.source) / cut.size;
        return cut.dest + ratio * cut.outSize;
      }
      result = cut.dest + cut.outSize;
    }
    return result;
  };
  return [map(range[0]), map(range[1])];
}

function drawChecker(ctx, x, y, w, h, size) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  for (let yy = y; yy < y + h; yy += size) {
    for (let xx = x; xx < x + w; xx += size) {
      const even = (Math.floor((xx - x) / size) + Math.floor((yy - y) / size)) % 2 === 0;
      ctx.fillStyle = even ? '#d6d6d6' : '#b9b9b9';
      ctx.fillRect(xx, yy, size, size);
    }
  }
  ctx.restore();
}

function eventToContentPoint(event) {
  const rect = editorCanvas.getBoundingClientRect();
  const x = (event.clientX - rect.left - state.view.originX) / state.view.scale;
  const y = (event.clientY - rect.top - state.view.originY) / state.view.scale;
  if (x < -24 || y < -24 || x > state.view.imageW + 24 || y > state.view.imageH + 24) return null;
  return {
    x: clamp(Math.round(x), 0, contentW()),
    y: clamp(Math.round(y), 0, contentH())
  };
}

function updateRangeFromDrag() {
  const { start, current } = state.dragging;
  const key = state.tool;
  const axis = key.endsWith('X') ? 'x' : 'y';
  const max = key.endsWith('X') ? contentW() : contentH();
  const a = start[axis];
  const b = current[axis];
  state.ranges[key] = clampRange([Math.min(a, b), Math.max(a, b)], max);
  syncRangeInputs();
  drawAll();
}

function detectNinePatchBorder(img) {
  if (img.width < 3 || img.height < 3) return false;
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;
  let guidePixels = 0;
  for (let x = 0; x < img.width; x += 1) {
    if (isBlack(data, (x * 4))) guidePixels += 1;
    if (isBlack(data, ((img.height - 1) * img.width + x) * 4)) guidePixels += 1;
  }
  for (let y = 0; y < img.height; y += 1) {
    if (isBlack(data, (y * img.width) * 4)) guidePixels += 1;
    if (isBlack(data, (y * img.width + img.width - 1) * 4)) guidePixels += 1;
  }
  return guidePixels > 0;
}

function detectRanges(img, hasBorder) {
  const w = hasBorder ? img.width - 2 : img.width;
  const h = hasBorder ? img.height - 2 : img.height;
  const fallback = {
    stretchX: [Math.floor(w * 0.35), Math.ceil(w * 0.65)],
    stretchY: [Math.floor(h * 0.35), Math.ceil(h * 0.65)],
    contentX: [0, w],
    contentY: [0, h]
  };
  if (!hasBorder) return fallback;

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;
  return {
    stretchX: readHorizontalRange(data, img.width, 0, w) || fallback.stretchX,
    stretchY: readVerticalRange(data, img.width, 0, h) || fallback.stretchY,
    contentX: readHorizontalRange(data, img.width, img.height - 1, w) || fallback.contentX,
    contentY: readVerticalRange(data, img.width, img.width - 1, h) || fallback.contentY
  };
}

function readHorizontalRange(data, imageW, y, contentWidth) {
  let start = null;
  let end = null;
  for (let x = 1; x <= contentWidth; x += 1) {
    if (isBlack(data, (y * imageW + x) * 4)) {
      if (start === null) start = x - 1;
      end = x;
    }
  }
  return start === null ? null : [start, Math.max(start + 1, end)];
}

function readVerticalRange(data, imageW, x, contentHeight) {
  let start = null;
  let end = null;
  for (let y = 1; y <= contentHeight; y += 1) {
    if (isBlack(data, (y * imageW + x) * 4)) {
      if (start === null) start = y - 1;
      end = y;
    }
  }
  return start === null ? null : [start, Math.max(start + 1, end)];
}

function isBlack(data, i) {
  return data[i + 3] > 128 && data[i] < 24 && data[i + 1] < 24 && data[i + 2] < 24;
}

function extractContentCanvas(img, hasBorder) {
  const canvas = document.createElement('canvas');
  canvas.width = hasBorder ? img.width - 2 : img.width;
  canvas.height = hasBorder ? img.height - 2 : img.height;
  const ctx = canvas.getContext('2d');
  if (hasBorder) {
    ctx.drawImage(img, 1, 1, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.drawImage(img, 0, 0);
  }
  return canvas;
}

function buildSourceNinePatch() {
  const w = contentW();
  const h = contentH();
  const canvas = document.createElement('canvas');
  canvas.width = w + 2;
  canvas.height = h + 2;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(state.contentCanvas, 1, 1);
  paintGuide(ctx, state.ranges.stretchX, 'top', w, h);
  paintGuide(ctx, state.ranges.stretchY, 'left', w, h);
  paintGuide(ctx, state.ranges.contentX, 'bottom', w, h);
  paintGuide(ctx, state.ranges.contentY, 'right', w, h);
  return canvas.toDataURL('image/png');
}

function paintGuide(ctx, range, side, w, h) {
  const [start, end] = side === 'top' || side === 'bottom'
    ? clampRange(range, w)
    : clampRange(range, h);
  ctx.fillStyle = '#000000';
  if (side === 'top') ctx.fillRect(start + 1, 0, end - start, 1);
  if (side === 'bottom') ctx.fillRect(start + 1, h + 1, end - start, 1);
  if (side === 'left') ctx.fillRect(0, start + 1, 1, end - start);
  if (side === 'right') ctx.fillRect(w + 1, start + 1, 1, end - start);
}

function syncRangeInputs() {
  Object.entries(rangeInputs).forEach(([key, inputs]) => {
    const range = state.ranges[key];
    inputs[0].value = range[0];
    inputs[1].value = range[1];
    const max = key.endsWith('X') ? contentW() : contentH();
    inputs.forEach((input) => {
      input.max = max;
      input.disabled = !state.img;
    });
  });
}

function setStatus(message) {
  els.statusText.textContent = message;
}

function contentW() {
  return Math.max(1, state.contentCanvas?.width || 1);
}

function contentH() {
  return Math.max(1, state.contentCanvas?.height || 1);
}

function clampRange(range, max) {
  let start = clamp(Math.round(range[0]), 0, max - 1);
  let end = clamp(Math.round(range[1]), start + 1, max);
  return [start, end];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toolLabel(key) {
  return {
    stretchX: t('stretchX'),
    stretchY: t('stretchY'),
    contentX: t('contentX'),
    contentY: t('contentY')
  }[key];
}

function ensureNinePatchName(name) {
  const clean = name.replace(/\.png$/i, '').replace(/\.9$/i, '');
  return `${clean}.9.png`;
}

function isNinePatchName(name) {
  return /\.9\.png$/i.test(String(name));
}

function cloneRanges(ranges) {
  return {
    stretchX: [...ranges.stretchX],
    stretchY: [...ranges.stretchY],
    contentX: [...ranges.contentX],
    contentY: [...ranges.contentY]
  };
}

function createBrowserBridge() {
  return {
    openImage: () => new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png,.9.png';
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        resolve(file ? await readBrowserFile(file) : null);
      }, { once: true });
      input.click();
    }),
    readDroppedFile: async (file) => readBrowserFile(file),
    saveSource: async ({ dataUrl, defaultName }) => {
      downloadDataUrl(dataUrl, defaultName || 'asset.9.png');
      return { path: `Downloads/${defaultName || 'asset.9.png'}` };
    },
    saveCompiled: async ({ dataUrl, defaultName }) => {
      if (window.location.protocol === 'file:') {
        throw new Error(t('fileModeCompile'));
      }
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, defaultName })
      });
      if (!response.ok) throw new Error(await response.text());
      const body = await response.json();
      return {
        path: body.localPath,
        localPath: body.localPath,
        hasNpTc: body.hasNpTc,
        hasNpOl: body.hasNpOl
      };
    }
  };
}

function readBrowserFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result);
      const binary = bytesToBinary(bytes);
      resolve({
        path: file.name,
        name: file.name,
        dataUrl: `data:image/png;base64,${btoa(binary)}`,
        hasNpTc: hasPngChunkBytes(bytes, 'npTc'),
        hasNpOl: hasPngChunkBytes(bytes, 'npOl')
      });
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function downloadDataUrl(dataUrl, fileName) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function beginUndoCapture() {
  if (!state.img || state.pendingUndo) return;
  state.pendingUndo = captureEditorState();
}

function commitUndoCapture() {
  if (!state.pendingUndo) return;
  commitUndoSnapshot(state.pendingUndo);
  state.pendingUndo = null;
}

function commitUndoSnapshot(snapshot) {
  if (!snapshot || snapshotsEqual(snapshot, captureEditorState())) return;
  pushUndoSnapshot(snapshot);
}

function pushUndoSnapshot(snapshot) {
  if (!snapshot) return;
  state.undoStack.push(cloneEditorState(snapshot));
  if (state.undoStack.length > 60) state.undoStack.shift();
}

function undoLastOperation() {
  if (!state.img || state.undoStack.length === 0) return setStatus(t('noUndo'));
  const snapshot = state.undoStack.pop();
  state.pendingUndo = null;
  applyEditorState(snapshot);
  setStatus(t('undoDone'));
}

function captureEditorState() {
  return {
    ranges: cloneRanges(state.ranges),
    previewW: String(els.previewW.value),
    previewH: String(els.previewH.value),
    showContent: Boolean(els.showContent.checked)
  };
}

function cloneEditorState(snapshot) {
  return {
    ranges: cloneRanges(snapshot.ranges),
    previewW: String(snapshot.previewW),
    previewH: String(snapshot.previewH),
    showContent: Boolean(snapshot.showContent)
  };
}

function applyEditorState(snapshot) {
  state.ranges = cloneRanges(snapshot.ranges);
  els.previewW.value = snapshot.previewW;
  els.previewH.value = snapshot.previewH;
  els.showContent.checked = snapshot.showContent;
  syncRangeInputs();
  drawAll();
}

function snapshotsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function hasPngChunkBytes(bytes, chunkType) {
  if (!bytes || bytes.length < 16) return false;
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = (
      (bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]
    ) >>> 0;
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
    if (type === chunkType) return true;
    offset += 12 + length;
  }
  return false;
}

function bytesToBinary(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return binary;
}

function t(key, values = {}) {
  const dict = I18N[state.locale] || I18N['zh-CN'];
  const fallback = I18N['zh-CN'][key] || key;
  return String(dict[key] || fallback).replace(/\{(\w+)\}/g, (_match, name) => values[name] ?? '');
}

function applyLanguage() {
  if (!I18N[state.locale]) state.locale = 'zh-CN';
  els.languageSelect.value = state.locale;
  document.documentElement.lang = state.locale;
  document.title = t('appTitle');
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    if (state.img && (node === els.fileMeta || node === els.statusText)) return;
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll('[data-title-i18n]').forEach((node) => {
    node.title = t(node.dataset.titleI18n);
  });
  if (!state.img) {
    els.fileMeta.textContent = t('noFile');
    els.statusText.textContent = t('waitingOpen');
    els.borderBadge.textContent = t('borderUnchecked');
    els.chunkBadge.textContent = t('chunkMissing');
  } else {
    els.borderBadge.textContent = state.hasNineBorder
      ? t('borderDetected')
      : state.autoPreparedNinePatch
        ? t('borderPrepared')
        : t('borderNew');
    els.chunkBadge.textContent = state.hasNpTc ? t('chunkDetected') : t('chunkMissing');
  }
}

function buildParamsText() {
  const params = {
    file: state.fileName,
    sourcePath: state.filePath,
    size: { width: contentW(), height: contentH() },
    stretch: {
      x: [...state.ranges.stretchX],
      y: [...state.ranges.stretchY]
    },
    content: {
      x: [...state.ranges.contentX],
      y: [...state.ranges.contentY]
    },
    preview: {
      width: Number(els.previewW.value),
      height: Number(els.previewH.value)
    },
    ninePatch: {
      hasGuideBorder: state.hasNineBorder,
      autoPrepared: state.autoPreparedNinePatch,
      hasNpTc: state.hasNpTc
    }
  };

  return [
    t('paramsHeader'),
    `file=${params.file}`,
    `size=${params.size.width}x${params.size.height}`,
    `stretchX=${params.stretch.x.join(',')}`,
    `stretchY=${params.stretch.y.join(',')}`,
    `contentX=${params.content.x.join(',')}`,
    `contentY=${params.content.y.join(',')}`,
    `preview=${params.preview.width}x${params.preview.height}`,
    '',
    JSON.stringify(params, null, 2)
  ].join('\n');
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  textarea.remove();
  if (!ok) throw new Error('document.execCommand(copy) failed');
}

applyLanguage();
resizeCanvases();
syncRangeInputs();
