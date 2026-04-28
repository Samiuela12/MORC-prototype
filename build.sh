#!/usr/bin/env bash
set -e
echo "=== Installing Python deps ==="
pip install -r backend/requirements.txt

echo "=== Building React frontend ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Build complete ==="
