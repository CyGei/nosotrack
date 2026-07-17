#!/usr/bin/env bash
# Render og-card.html at 2x with headless Chromium, downsample to 1200x630
# (sips) → public/images/og-card.png. Override CHROME if the path changes.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$HERE/../../public/images"
HTML="$HERE/og-card.html"
TMP_2X="$HERE/.og-2x.png"
FINAL="$OUT_DIR/og-card.png"

CHROME="${CHROME:-$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell}"

if [[ ! -x "$CHROME" ]]; then
  echo "Chromium not found at: $CHROME" >&2
  echo "Set CHROME=/path/to/chrome-headless-shell and re-run." >&2
  exit 1
fi

"$CHROME" \
  --no-sandbox \
  --disable-gpu \
  --hide-scrollbars \
  --force-color-profile=srgb \
  --force-device-scale-factor=2 \
  --run-all-compositor-stages-before-draw \
  --virtual-time-budget=4000 \
  --default-background-color=ffffffff \
  --window-size=1200,630 \
  --screenshot="$TMP_2X" \
  "file://$HTML"

# sips -z takes HEIGHT then WIDTH.
sips -z 630 1200 "$TMP_2X" --out "$FINAL" >/dev/null
rm -f "$TMP_2X"

echo "Wrote $FINAL"
sips -g pixelWidth -g pixelHeight "$FINAL"
