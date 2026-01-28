#!/bin/bash
# Setup script for devcontainer
# Fixes symlinks and installs dependencies

set -e

echo "Setting up devcontainer..."

# Install dependencies
cd /workspace/chatgpt-acp-app
npm ci

echo "Setup complete!"
