#!/bin/zsh
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-49390}"
URL="http://127.0.0.1:$PORT/"

NODE_BIN="$(command -v node || true)"
if [ -z "$NODE_BIN" ] && [ -x /opt/homebrew/bin/node ]; then NODE_BIN=/opt/homebrew/bin/node; fi
if [ -z "$NODE_BIN" ] && [ -x /usr/local/bin/node ]; then NODE_BIN=/usr/local/bin/node; fi
if [ -z "$NODE_BIN" ] && [ -x /Users/monet/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ]; then
  NODE_BIN=/Users/monet/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
fi

if [ -z "$NODE_BIN" ]; then
  osascript -e 'display alert "未找到 Node.js" message "请先安装 Node.js，或在 Codex 里运行 node server.js。"'
  exit 1
fi

if ! lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  cd "$APP_DIR"
  nohup "$NODE_BIN" server.js > server.log 2>&1 &
  sleep 1
fi

open "$URL"
