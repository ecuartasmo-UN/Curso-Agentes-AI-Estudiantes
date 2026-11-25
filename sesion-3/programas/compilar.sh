#!/bin/sh
# Compila los programas de la sesión 3 a un solo archivo IIFE, sin módulos ES.
# Uso: sh programas/compilar.sh
# Necesita Node.js 18 o posterior. npx descarga esbuild 0.28.2 a su caché, fuera del repositorio.
# El tokenizer de la demostración en vivo (gpt-tokenizer 4.1.2) ya viene compilado de la sesión 2,
# en assets/vendor/gpt-tokenizer-4.1.2/. Para volver a compilarlo, usa programas/compilar.sh de la sesión 2.
set -e
cd "$(dirname "$0")"
npx --yes esbuild@0.28.2 src/principal.jsx --bundle --format=iife --target=es2019 --charset=utf8 \
  --legal-comments=none --outfile=../assets/js/programas.js
echo "Listo: assets/js/programas.js"
