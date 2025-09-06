#!/bin/bash

# Railway Build Script for Monorepo
# SAFE: Only adds build automation, doesn't modify existing functionality

set -e

echo "🚀 Starting Railway build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build packages
echo "🔨 Building packages..."
npm run build --workspace=@interview-me/types
npm run build --workspace=@interview-me/ui

# Build API
echo "🔨 Building API..."
npm run build --workspace=@interview-me/api

echo "✅ Build completed successfully!"
