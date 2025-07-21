# Videopuzzle

A WebGL video puzzle game inspired by [videopuzzle.org](https://videopuzzle.org). I saw a post on Reddit about the original project. The concept inspired me to build my own version from scratch.

## How the core part works

1. A video is streamed directly from Pixabay. No local storage is used - frames are processed on the fly via the browser’s video element.
2. Each video frame is fed into a WebGL context. The frame is then subdivided into a grid of textures using shader and buffer operations. This creates a virtual grid overlay where each cell corresponds to a texture containing a portion of the original frame.
3. The textures (grid cells) are then shuffled randomly. This creates a scrambled version of the video frame, which looks like a puzzle.
4. The shuffled textures are rendered onto an HTML canvas element. The canvas acts as the main interaction layer, allowing texture selection, highlighting and visual effects like translation and swapping animations when a user drags and swaps pieces

This creates a dynamic, interactive puzzle from live video data, with real-time GPU rendering and minimal latency.

## Live Demo

Try it here: [https://videopuzzle-production.up.railway.app/](https://videopuzzle-production.up.railway.app/)

## Features

- Drag-and-drop video puzzle gameplay
- Guest users for progress tracking
- Moves and time ranking
- Tutorial mode for new users
- Responsive UI
- WebGL as a core component
- PocketBase as backend

## Getting Started

### Prerequisites

- Docker
- Node.js (for local development)

### Cloning the repo

```sh
git clone https://github.com/ba2ooz/videopuzzle.git

cd videopuzzle
```

### Running with Docker

```sh
docker compose up --build
```

### Running manually

1. Install frontend dependencies and build:
    ```sh
    cd frontend 
    npm install
    npm run build
    npm run dev
    ```
2. Run PocketBase with preloaded data:
    ```sh
    cd pocketbase
    ./pocketbase serve --http=0.0.0.0:8090
    ```
    > _No need to download PocketBase separately, the binary and data are included._

### Serving

- Frontend: [http://localhost:1234](http://localhost:1234).
- Backend: [http://0.0.0.0:8090/_/](http://0.0.0.0:8090/_/).

### PocketBase Credentials (for local development)

- **email:** `admin@admin.admin`
- **password:** `adminadmin`

> _Credentials are for local use only. The production database is not meant to be accessed through a dashboard. It is only a demo, so any log in attempts will fail._

## Project Structure

### Frontend

The main logic and UI for Videopuzzle is organized in `frontend/src` as follows:

```
frontend/
└── src/
    ├── animations/           # Animation controllers and effects for puzzle tiles and transitions
    ├── components/           # UI components for screens and dialogs
    │   ├── puzzle-game/      # Puzzle game canvas and mechanics
    │   ├── puzzle-solver/    # Main puzzle solving screen and controls
    │   ├── puzzle-list/      # Puzzle selection grid
    │   ├── puzzle-card/      # Individual puzzle card UI
    │   ├── puzzle-stats-modal/ # Modal for showing puzzle stats after solving
    │   ├── shared/           # Shared UI elements
    │   └── ...               # Router, NotFound and tutorial related stuff
    ├── core/                 # Core puzzle logic and graphics
    │   ├── graphics/         # WebGL buffers and scene management
    │   ├── puzzle/           # Grid, tile, and puzzle mechanics
    │   └── ...               # WebGL context and shaders
    └── services/             # Data access and business logic
```

### Backend

Includes the pocketbase binary and preloaded data:

```
pocketbase/ 
├── pb_data/    
└── pocketbase
```