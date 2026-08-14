# Nine-Patch Editor

A local macOS-friendly editor for Android `.9.png` assets.

## Features

- Open or drag PNG and `.9.png` files.
- Plain `.png` files are automatically prepared as source `.9.png` images.
- Edit horizontal stretch, vertical stretch, content width, and content height ranges.
- Copy current nine-patch parameters as text plus JSON.
- Undo with `Command+Z` on macOS and `Ctrl+Z` on Windows/Linux.
- Reset back to the initial regions detected when the file was opened.
- Live stretch preview with rulers around the editing canvas.
- Export source `.9.png` with 1px guide borders.
- Compile Android-ready `.9.png` through `aapt singleCrunch`.
- Multilingual UI: Chinese, English, Japanese, and Korean.

## Run

On macOS, double-click:

```text
打开点九编辑器.command
```

On Windows, double-click:

```text
start-nine-patch-editor.bat
```

Or run manually:

```bash
node server.js
```

Then open:

```text
http://127.0.0.1:49390/
```

Do not use `file://.../index.html` for compilation. Browsers cannot call local `aapt` from a directly opened HTML file.

## Compile Support

The compiler probes these `aapt` paths:

- `/Applications/mini-editor-pro.app/Contents/MacOS/aapt`
- `/opt/homebrew/bin/aapt`
- `/usr/local/bin/aapt`

When compiling on macOS, the app asks where to save the compiled `.9.png`.
