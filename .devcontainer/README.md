# chatgpt-acp-app Dev Container

This directory contains the configuration for the VS Code Dev Container for `chatgpt-acp-app`.

## Quick Start

### Option 1: VS Code (Recommended)
1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
2. Open the project in VS Code.
3. Click "Reopen in Container" when prompted, or run the command `Dev Containers: Reopen in Container`.

### Option 2: Docker Compose
1. Run `docker-compose -f .devcontainer/docker-compose.yml up --build`

## Configuration

- **Container Name:** `chatgpt-acp-app`
- **Base Image:** `node:20`
- **Exposed Ports:** `8787`
- **Work Directory:** `/workspace/chatgpt-acp-app`

## Directory Structure

```
.devcontainer/
├── devcontainer.json      # VS Code config
├── Dockerfile             # Image definition
├── docker-compose.yml     # Compose config
├── setup.sh               # Post-create script
└── README.md              # This file
```
