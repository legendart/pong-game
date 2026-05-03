#!/bin/zsh
# Javis 백엔드 서버 시작 스크립트
cd "$(dirname "$0")/backend"
pkill -f "node server.js" 2>/dev/null
sleep 1
node server.js
