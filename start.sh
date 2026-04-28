#!/usr/bin/env bash
set -e
export DB_PATH="${DB_PATH:-/opt/render/project/src/tcms.db}"
cd backend
python -c "from app import init_db; init_db()"
exec gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 60
