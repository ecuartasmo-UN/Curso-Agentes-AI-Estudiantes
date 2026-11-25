#!/bin/sh
# Compila los programas de la sesión 2 a un solo archivo IIFE, sin módulos ES.
# Uso: sh programas/compilar.sh            (solo los programas)
#      sh programas/compilar.sh tokenizer  (también el tokenizer de la demostración en vivo)
# Necesita Node.js 18 o posterior. npx descarga esbuild 0.28.2 a su caché, fuera del repositorio.
set -e
cd "$(dirname "$0")"
ESBUILD="npx --yes esbuild@0.28.2"

$ESBUILD src/principal.jsx --bundle --format=iife --target=es2019 --charset=utf8 \
  --legal-comments=none --outfile=../assets/js/programas.js

if [ "$1" = "tokenizer" ]; then
  # gpt-tokenizer 4.1.2 (MIT) ya no publica builds UMD: lo empaquetamos como IIFE con la global
  # GPTTokenizer_o200k_base. La instalación va a una caché fuera del repositorio.
  CACHE="${CACHE_TOKENIZER:-$HOME/.cache/agentes-s2-tokenizer}"
  DESTINO="$(pwd)/../assets/vendor/gpt-tokenizer-4.1.2"
  mkdir -p "$CACHE" "$DESTINO"
  (
    cd "$CACHE"
    [ -f package.json ] || npm init -y >/dev/null
    npm install --no-audit --no-fund --silent gpt-tokenizer@4.1.2
    echo "export * from 'gpt-tokenizer/encoding/o200k_base';" > entrada.js
    $ESBUILD entrada.js --bundle --format=iife --global-name=GPTTokenizer_o200k_base --minify \
      --outfile="$DESTINO/o200k_base.js"
    cp node_modules/gpt-tokenizer/LICENSE "$DESTINO/LICENSE"
    cp node_modules/gpt-tokenizer/data/Unicode-LICENSE.txt "$DESTINO/Unicode-LICENSE.txt"
  )
fi
echo "Listo: assets/js/programas.js"
