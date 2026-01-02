#!/usr/bin/env bash
set -e

# ==========================
# CONFIGURATION
# ==========================

BUCKET_NAME="obsidian-smart-capture-frontend"        # 🔴 à remplacer
DIST_DIR="dist"                        # Vite / React
AWS_PROFILE="default"                  # ou ton profil AWS
CLOUDFRONT_DISTRIBUTION_ID="EFWWQQ891C9TX"          # optionnel

# ==========================
# BUILD
# ==========================

echo "🛠️  Building frontend..."
npm run build

if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Build failed: $DIST_DIR not found"
  exit 1
fi

# ==========================
# DEPLOY TO S3
# ==========================

echo "🚀 Syncing to S3 bucket: $BUCKET_NAME"

aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" \
  --delete \
  --profile "$AWS_PROFILE"

echo "✅ S3 sync completed"

# ==========================
# OPTIONAL: CLOUDFRONT INVALIDATION
# ==========================

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "🔄 Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" \
    --profile "$AWS_PROFILE"
  echo "✅ CloudFront invalidation requested"
fi

echo "🎉 Frontend deployed successfully"
