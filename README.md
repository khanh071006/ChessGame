# ChessGame — C++ AI Engine Integration (POC)

Play Chess against a highly optimized **C++ AI Engine** directly from a modern Web interface. This repository is a proof-of-concept that demonstrates cross-platform architecture — combining a sleek **ReactJS Frontend**, a scalable **Java Spring Boot Backend**, and a blazingly fast **C++ Minimax Engine** into a single cohesive system.

> New here? Read this file to understand the architecture, then follow the instructions in the Build section to run the game locally.

---

## What happens when you make a move

```text
   FRONTEND (ReactJS)               BACKEND (Spring Boot)             AI ENGINE (C++)
 ┌──────────────────────┐         ┌─────────────────────────┐        ┌───────────────────┐
 │ User moves piece     │         │ ChessController (REST)  │        │ AI.exe            │
 │                      │  HTTP   │                         │  exec  │                   │
 │ Request AI move      ├────────▶│ GET /api/ai/move?fen=...├───────▶│ Parse FEN         │
 │   (FEN + Depth)      │         │                         │        │ Run Minimax + A/B │
 │                      │         │                         │        │ Quiescence Search │
 │ Update board state   │◀────────┤ JSON {move: "e2e4"}     │◀───────┤ stdout: e2e4      │
 └──────────────────────┘         └─────────────────────────┘        └───────────────────┘
```

1. The user plays a move on the `react-chessboard` → The **Frontend** generates the current board state (FEN string).
2. The UI sends an HTTP GET request with the FEN and Difficulty (Depth) to the **Backend** (Spring Boot).
3. The **Backend** uses `ProcessBuilder` to spawn a sub-process, executing `AI.exe` and passing the FEN and Depth as command-line arguments.
4. The **C++ Engine** reconstructs the board, runs the Minimax Alpha-Beta algorithm, and prints the best move to standard output (`stdout`).
5. The Backend captures the output, wraps it in JSON, and returns it to the Web UI → **The AI moves on your screen.**

---

## Repository layout

| Path | Lang | Output | Role |
|---|---|---|---|
| [`ai_core/`](ai_core/) | C++ | `AI.exe` | **AI Engine** — The core Minimax solver and chess rules |
| [`chess-backend/`](chess-backend/) | Java | Spring Boot app | **Backend Bridge** — Exposes the C++ engine via REST APIs |
| [`src/`](src/) | TS/TSX | Web UI | **Frontend** — The React application and chessboard |
| `package.json` | JSON | — | Frontend dependencies (`chess.js`, `react-chessboard`) |
| `pom.xml` | XML | — | Backend dependencies (Spring Web) |

---

## The seams (where to plug in real work)

This modular architecture allows you to easily replace or upgrade specific parts of the system without affecting the others:

| Seam | Lives in | Today | Replace with |
|---|---|---|---|
| ★ **Evaluation Function** | `ai_core/AI.cpp` | Piece values + Static PST | A Neural Network (NNUE) or deep learning model |
| ★ **Search Algorithm** | `ai_core/AI.cpp` | Minimax with Alpha-Beta | Monte Carlo Tree Search (MCTS) |
| ★ **Backend Transport** | `chess-backend/.../ChessController.java` | Synchronous `ProcessBuilder` | Message Queues (RabbitMQ) for asynchronous processing |
| ★ **User Interface** | `src/components/` | 2D React Chessboard | A fully 3D rendered board using Three.js |

---

## Prerequisites

- **Git** (to clone the repository).
- **Node.js** (v18+) for the frontend.
- **Java JDK** (v17 or v21) for the backend.
- **C++ Compiler** (GCC/MinGW) to build the AI engine.

## Build

You need to compile the C++ engine before the backend can interact with it:

```powershell
# Compile the C++ Engine (O3 flag is mandatory for max speed)
g++ -O3 "ai_core\AI.cpp" "ai_core\thc.cpp" -o "ai_core\AI.exe"
```

*Note: The backend looks for `AI.exe` in the `ai_core` folder. If you don't compile it, the API will fail.*

## Run / install

You must start both the backend and the frontend in parallel to play the game.

**1. Start the Backend:**
```powershell
cd chess-backend
./mvnw spring-boot:run
```
*(The backend will start listening on port 8080).*

**2. Start the Frontend:**
```powershell
# Open a new terminal at the root of the project
npm install
npm run dev
```
*(The frontend will start on `http://localhost:5173`. Open this URL in your browser).*

---

## Adding a feature — where to start

| You want to… | Touch | Notes |
|---|---|---|
| Make the AI smarter | `ai_core/AI.cpp` | You must re-run the `g++` compilation command after editing C++ code. |
| Add a new API endpoint | `ChessController.java` | The Spring Boot server will auto-reload if DevTools is installed. |
| Change AI depth mapping | `src/AI.ts` | The frontend maps difficulty to Depth (e.g., Expert = Depth 5). |
| Change the board visuals | `src/App.tsx` | Vite will hot-reload your changes instantly in the browser. |
