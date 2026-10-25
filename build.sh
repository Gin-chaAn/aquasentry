#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "--- Installing backend requirements ---"
pip install -r backend/requirements.txt

echo "--- Building React frontend ---"
cd frontend
npm install
npm run build
cd ..

echo "--- Build complete! ---"
