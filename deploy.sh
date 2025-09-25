#!/bin/bash
set -e

# Nome do repositório no GitHub
REPO_NAME="ThermoFlex-Dashboard"

echo "🚀 Iniciando deploy do projeto $REPO_NAME..."

# 1. Build do projeto
echo "📦 Rodando build local..."
npm run build

# 2. Publicar no GitHub Pages
echo "🌍 Publicando no GitHub Pages..."
npm run deploy

# 3. Commit e push para o repositório principal
echo "📤 Subindo alterações para o repositório..."
git add .
git commit -m "🚀 Deploy automático para GitHub Pages"
git push origin main

echo "✅ Deploy finalizado com sucesso!"
echo "🔗 Acesse: https://scoobiii.github.io/$REPO_NAME/"
