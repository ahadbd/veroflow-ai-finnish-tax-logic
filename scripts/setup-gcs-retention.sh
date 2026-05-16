#!/usr/bin/env bash
# =============================================================================
# VeroFlow AI — GCS Bucket Retention & Versioning Setup
# Compliance: Finnish Accounting Act KPL 2:10§ (10-year data retention)
# =============================================================================
# Prerequisites:
#   1. gcloud CLI installed and authenticated: gcloud auth login
#   2. gsutil installed (comes with gcloud SDK)
#   3. Firebase project ID set: export PROJECT_ID=veroflow-ai
#
# Run once per environment (production):
#   chmod +x scripts/setup-gcs-retention.sh
#   ./scripts/setup-gcs-retention.sh
# =============================================================================

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-veroflow-ai}"
BUCKET="${BUCKET:-${PROJECT_ID}.firebasestorage.app}"
RETENTION_YEARS=10
RETENTION_SECONDS=$((RETENTION_YEARS * 365 * 24 * 3600))  # 315,360,000 seconds

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  VeroFlow AI — KPL 2:10§ Storage Retention Setup            ║"
echo "║  Project: ${PROJECT_ID}"
echo "║  Bucket:  ${BUCKET}"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Enable Object Versioning ──────────────────────────────────────────
# Keeps all previous versions of overwritten/deleted files accessible.
# Required so accountants can retrieve any historical receipt version.
echo "▶ Step 1/4 — Enabling Object Versioning..."
gsutil versioning set on "gs://${BUCKET}"
echo "  ✓ Object Versioning enabled on gs://${BUCKET}"
echo ""

# ── Step 2: Set Retention Policy ─────────────────────────────────────────────
# Objects (receipts, exports) cannot be deleted or overwritten before 10 years.
# The lock makes this policy permanent (cannot be shortened, only extended).
echo "▶ Step 2/4 — Setting ${RETENTION_YEARS}-year Retention Policy..."
gsutil retention set "${RETENTION_SECONDS}s" "gs://${BUCKET}"
echo "  ✓ Retention policy: ${RETENTION_SECONDS}s (~${RETENTION_YEARS} years)"
echo ""

# ── Step 3: Lock the Retention Policy ────────────────────────────────────────
# CRITICAL: Locking makes the retention policy irreversible.
# Only do this in production once you are confident in the settings.
# Uncomment to activate — requires explicit confirmation.
echo "▶ Step 3/4 — [PRODUCTION ONLY] Lock Retention Policy..."
echo "  ⚠ WARNING: Locking is IRREVERSIBLE. Uncomment line below only in prod."
# gsutil retention lock "gs://${BUCKET}"
echo "  ↳ Skipped (comment out this line and uncomment above for production)"
echo ""

# ── Step 4: Configure Lifecycle — Delete old non-current versions ─────────────
# Versions older than 10 years + 30 days are eligible for deletion.
# This prevents unbounded storage growth while maintaining full compliance.
echo "▶ Step 4/4 — Applying Lifecycle Policy (purge versions > 10y + 30 days)..."

cat > /tmp/veroflow-lifecycle.json << 'EOF'
{
  "rule": [
    {
      "action": { "type": "Delete" },
      "condition": {
        "daysSinceNoncurrentTime": 3680,
        "isLive": false
      }
    }
  ]
}
EOF

gsutil lifecycle set /tmp/veroflow-lifecycle.json "gs://${BUCKET}"
echo "  ✓ Lifecycle policy applied: non-current versions purged after ~10.1 years"
rm /tmp/veroflow-lifecycle.json
echo ""

# ── Summary ───────────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════════"
echo "  KPL 2:10§ Compliance Setup Complete"
echo ""
echo "  ✓ Object Versioning:    ON"
echo "  ✓ Retention Policy:     ${RETENTION_YEARS} years (${RETENTION_SECONDS}s)"
echo "  ✓ Policy Lock:          Pending (run manually in prod)"
echo "  ✓ Lifecycle Cleanup:    Purge non-live versions after ~10.1 years"
echo ""
echo "  Verify via Firebase Console:"
echo "  https://console.firebase.google.com/project/${PROJECT_ID}/storage"
echo "═══════════════════════════════════════════════════════════════"
