#!/bin/bash
# ============================================================
# Deploy script: build static portfolio and rsync to server
# ============================================================
# Usage:
#   chmod +x deploy/deploy.sh
#   ./deploy/deploy.sh
#
# Prerequisites:
#   1. SSH key already set up for the target server
# ============================================================

set -e

# Config — change these to match your setup
SERVER="root@49.232.49.175"             # Server
REMOTE_PATH="/var/www/studio"            # Nginx document root
BUILD_DIR=".output/public"               # Nuxt static output (from nuxi generate)

echo "=== Building Static Site ==="

# Load env vars
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Clean and build
rm -rf $BUILD_DIR
npx nuxi generate

echo "=== Deploying to $SERVER ==="

# Rsync to server
rsync -avz --delete $BUILD_DIR/ "$SERVER:$REMOTE_PATH/"

echo "=== Done ==="
echo "Portfolio:  http://49.232.49.175"
echo "Admin:      http://49.232.49.175/admin/login"
