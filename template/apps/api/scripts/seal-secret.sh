#!/usr/bin/env bash
#
# Regenerates (or merges) the SealedSecret for nexst-api from .env and
# writes it into kustomize/ where Flux picks it up. Only the keys listed in
# kustomize/secret.keys are sealed; everything else is ConfigMap material.
#
# One command, no flags needed:
#   ./scripts/seal-secret.sh
#
# On the first run it fetches the sealed-secrets controller's public cert via
# kubectl and caches it at kustomize/sealed-secrets.pem (commit that file — it
# is a public key). Every later run seals offline from the cached cert.
#
# Requires: kubectl, kubeseal   (bash >= 4 — do NOT run with `sh`)
#
# Usage:
#   ./scripts/seal-secret.sh [OUT_FILE]
#     OUT_FILE   default: kustomize/overlays/prod/sealedsecret.yaml
#                "-" writes to stdout instead of a file
#
# Env vars (all optional):
#   ENV_FILE             env file to seal from     (default: <repo>/.env)
#   NAMESPACE            target namespace          (default: nexst)
#   SECRET_NAME          Secret / SealedSecret name (default: nexst-api-secret)
#   KEYS_FILE            allowlist, one key per line (default: <repo>/kustomize/secret.keys)
#   SEALED_SECRETS_CERT  explicit cert path/URL; skips the cached pem
#   CERT_FILE            where the cached cert lives (default: <repo>/kustomize/sealed-secrets.pem)
#   CONTROLLER_NS        controller namespace      (default: sealed-secrets)
#   CONTROLLER_NAME      controller service name   (default: sealed-secrets-controller)
#   REFETCH_CERT=1       re-fetch the cert even if the cache exists
#   MERGE=1             merge into OUT_FILE instead of regenerating it
#
# Staging:
#   NAMESPACE=nexst-staging \
#     ./scripts/seal-secret.sh kustomize/overlays/staging/sealedsecret.yaml

if [ -z "${BASH_VERSINFO:-}" ] || [ "${BASH_VERSINFO:-0}" -lt 4 ]; then
  if [ -z "${_SEAL_REEXEC:-}" ]; then
    for _b in /opt/homebrew/bin/bash /usr/local/bin/bash; do
      [ -x "$_b" ] && exec env _SEAL_REEXEC=1 "$_b" "$0" "$@"
    done
  fi
  echo "error: this script needs bash >= 4; install one with 'brew install bash'" >&2
  echo "       then run: ./scripts/seal-secret.sh $*" >&2
  exit 1
fi

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

OUT_FILE="${1:-$REPO_ROOT/kustomize/overlays/prod/sealedsecret.yaml}"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/.env}"
NAMESPACE="${NAMESPACE:-nexst}"
SECRET_NAME="${SECRET_NAME:-nexst-api-secret}"
KEYS_FILE="${KEYS_FILE:-$REPO_ROOT/kustomize/secret.keys}"
CERT_FILE="${CERT_FILE:-$REPO_ROOT/kustomize/sealedsecrets.pem}"
CONTROLLER_NS="${CONTROLLER_NS:-sealed-secrets}"
CONTROLLER_NAME="${CONTROLLER_NAME:-sealed-secrets-controller}"
MERGE="${MERGE:-}"

for bin in kubectl kubeseal; do
  command -v "$bin" >/dev/null || { echo "error: $bin not found in PATH" >&2; exit 1; }
done
[ -f "$ENV_FILE" ] || { echo "error: env file not found: $ENV_FILE" >&2; exit 1; }
if [ -n "$MERGE" ] && { [ "$OUT_FILE" = "-" ] || [ ! -f "$OUT_FILE" ]; }; then
  echo "error: MERGE=1 needs an existing OUT_FILE" >&2; exit 1
fi

# --- controller cert: explicit > cached > fetch once via kubectl ----------
if [ -n "${SEALED_SECRETS_CERT:-}" ]; then
  CERT_FILE="$SEALED_SECRETS_CERT"
elif [ ! -f "$CERT_FILE" ] || [ -n "${REFETCH_CERT:-}" ]; then
  kubectl get svc -n "$CONTROLLER_NS" "$CONTROLLER_NAME" >/dev/null 2>&1 || {
    echo "error: service $CONTROLLER_NS/$CONTROLLER_NAME not reachable via kubectl." >&2
    echo "       set CONTROLLER_NS / CONTROLLER_NAME, or SEALED_SECRETS_CERT=<pem>." >&2
    exit 1
  }
  echo "fetching public cert from $CONTROLLER_NS/$CONTROLLER_NAME ..." >&2
  mkdir -p "$(dirname "$CERT_FILE")"
  tmpc="$(mktemp "${CERT_FILE}.XXXXXX")"
  trap 'rm -f "$tmpc"' EXIT
  kubeseal --controller-namespace "$CONTROLLER_NS" --controller-name "$CONTROLLER_NAME" \
    --fetch-cert > "$tmpc"
  mv "$tmpc" "$CERT_FILE"
  trap - EXIT
  echo "cached $CERT_FILE (public key — commit it)" >&2
fi

# --- optional key allowlist -------------------------------------------------
declare -A ALLOW=()
use_allow=0
if [ -f "$KEYS_FILE" ]; then
  use_allow=1
  while IFS= read -r k || [ -n "$k" ]; do
    k="${k%%#*}"; k="$(printf '%s' "$k" | tr -d '[:space:]')"
    [ -n "$k" ] && ALLOW["$k"]=1
  done < "$KEYS_FILE"
  echo "allowlist: $KEYS_FILE (${#ALLOW[@]} keys)" >&2
fi

# --- env parsing ------------------------------------------------------------
declare -A VALUES=()

load_env_file() {
  local file="$1" key val
  [ -f "$file" ] || return 0
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line#"${line%%[![:space:]]*}"}"          # ltrim
    [ -z "$line" ] && continue
    case "$line" in \#*) continue ;; esac
    line="${line#export }"
    [ "${line%%=*}" = "$line" ] && continue          # no '=' on the line
    key="$(printf '%s' "${line%%=*}" | tr -d '[:space:]')"
    [ -z "$key" ] && continue
    val="${line#*=}"
    if [ "${val#\"}" != "$val" ] && [ "${val%\"}" != "$val" ]; then
      val="${val#\"}"; val="${val%\"}"
    elif [ "${val#\'}" != "$val" ] && [ "${val%\'}" != "$val" ]; then
      val="${val#\'}"; val="${val%\'}"
    fi
    VALUES["$key"]="$val"
  done < "$file"
}

load_env_file "$ENV_FILE"

# --- select keys to seal ------------------------------------------------
declare -a LITERALS=() SEALED_KEYS=()
skipped_empty=0 skipped_filtered=0
for key in "${!VALUES[@]}"; do
  if [ "$use_allow" = 1 ] && [ -z "${ALLOW[$key]+x}" ]; then
    skipped_filtered=$((skipped_filtered + 1)); continue
  fi
  if [ -z "${VALUES[$key]}" ]; then
    skipped_empty=$((skipped_empty + 1)); continue
  fi
  LITERALS+=(--from-literal="$key=${VALUES[$key]}")
  SEALED_KEYS+=("$key")
done
[ "${#SEALED_KEYS[@]}" -gt 0 ] || { echo "error: no keys to seal" >&2; exit 1; }

raw_secret() {
  kubectl create secret generic "$SECRET_NAME" \
    --namespace "$NAMESPACE" "${LITERALS[@]}" \
    --dry-run=client -o yaml
}

KS_ARGS=(--format yaml --scope strict --namespace "$NAMESPACE" --name "$SECRET_NAME" --cert "$CERT_FILE")

echo "sealing ${#SEALED_KEYS[@]} keys for $NAMESPACE/$SECRET_NAME:" >&2
for key in $(printf '%s\n' "${SEALED_KEYS[@]}" | sort); do
  printf '  %s\n' "$key" >&2
done
[ "$skipped_filtered" -gt 0 ] && echo "  (skipped $skipped_filtered not in allowlist)" >&2
[ "$skipped_empty" -gt 0 ]    && echo "  (skipped $skipped_empty empty values)" >&2

if [ -n "$MERGE" ]; then
  raw_secret | kubeseal "${KS_ARGS[@]}" --merge-into "$OUT_FILE"
  echo "merged into $OUT_FILE" >&2
elif [ "$OUT_FILE" = "-" ]; then
  raw_secret | kubeseal "${KS_ARGS[@]}"
else
  mkdir -p "$(dirname "$OUT_FILE")"
  tmp="$(mktemp "${OUT_FILE}.XXXXXX")"
  trap 'rm -f "$tmp"' EXIT
  raw_secret | kubeseal "${KS_ARGS[@]}" > "$tmp"
  mv "$tmp" "$OUT_FILE"
  trap - EXIT
  echo "wrote $OUT_FILE" >&2
fi
