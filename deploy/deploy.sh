#!/bin/bash
# ============================================================
# Deploy script: build static portfolio and rsync to server
# ============================================================
# Usage:
#   chmod +x deploy/deploy.sh
#   ./deploy/deploy.sh
#
# Prerequisites:
#   1. Set SUPABASE_URL + SUPABASE_ANON_KEY in .env (or export them)
#   2. SSH key already set up for the target server
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

echo "SUPABASE_URL=$SUPABASE_URL"

# Clean and build
rm -rf $BUILD_DIR
npx nuxi generate

echo "=== Deploying to $SERVER ==="

# Rsync to server
rsync -avz --delete $BUILD_DIR/ "$SERVER:$REMOTE_PATH/"

echo "=== Done ==="
echo "Portfolio:  https://your-domain.com"
echo "Admin:      https://your-domain.com/admin/login"
echo "Supabase:   $SUPABASE_URL"
