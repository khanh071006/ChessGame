import { useState, useCallback, useEffect } from 'react'
import { Chess, Move } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { RotateCcw, Monitor, User, History, Swords, RefreshCw, Play } from 'lucide-react'
import { getBestMove } from './AI'

export default function App() {
  console.log("Rendering App...");
  
  // Game states
  const [appState, setAppState] = useState<'menu' | 'playing'>('menu')
  const [game, setGame] = useState(new Chess())
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white')
  const [difficulty, setDifficulty] = useState<string>('medium')
  
  // Interaction states
  const [moveFrom, setMoveFrom] = useState<string | null>(null)
  const [moveTo, setMoveTo] = useState<string | null>(null)
  const [showPromotionDialog, setShowPromotionDialog] = useState(false)
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({})
  
  // AI Move hook
  useEffect(() => {
    if (appState !== 'playing') return
    // Ngăn AI đi bài nếu lượt hiện tại không phải của AI
    const isAiTurn = (playerColor === 'white' && game.turn() === 'b') || 
                     (playerColor === 'black' && game.turn() === 'w')
    
    if (isAiTurn && !game.isGameOver() && !game.isDraw()) {
      const timer = setTimeout(async () => {
        const aiMove = await getBestMove(game, difficulty)
        if (!aiMove) return

        const newGame = new Chess()
        newGame.loadPgn(game.pgn())
        newGame.move(aiMove)
        setGame(newGame)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [game, difficulty, appState, playerColor])

  const startGame = () => {
    setGame(new Chess())
    setMoveFrom(null)
    setMoveTo(null)
    setShowPromotionDialog(false)
    setOptionSquares({})
    setAppState('playing')
  }

  const getMoveOptions = (square: string) => {
    const moves = game.moves({
      square,
      verbose: true
    }) as Move[]
    if (moves.length === 0) {
      setOptionSquares({})
      return false
    }

    const newSquares: Record<string, any> = {}
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to as any) && game.get(move.to as any)?.color !== game.get(square as any)?.color
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.5) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0, 0, 0, 0.25) 25%, transparent 25%)',
        borderRadius: '50%'
      }
    })
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    }
    setOptionSquares(newSquares)
    return true
  }

  const onSquareClick = (square: string) => {
    if (moveFrom === square) {
      setMoveFrom(null)
      setOptionSquares({})
      return
    }

    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square)
      if (hasMoveOptions) setMoveFrom(square)
      return
    }

    if (!optionSquares[square] && moveFrom !== square) {
      const hasMoveOptions = getMoveOptions(square)
      if (hasMoveOptions) {
        setMoveFrom(square)
      } else {
        setMoveFrom(null)
        setOptionSquares({})
      }
      return
    }

    // Check for promotion
    const piece = game.get(moveFrom as any)
    if (piece && piece.type === 'p' && (square[1] === '8' || square[1] === '1')) {
      const testGame = new Chess()
      testGame.loadPgn(game.pgn())
      try {
        const testMove = testGame.move({
          from: moveFrom,
          to: square,
          promotion: 'q'
        })
        if (testMove) {
          setMoveTo(square)
          setShowPromotionDialog(true)
          return
        }
      } catch (e) {
        // Fallback to normal if error
      }
    }

    const newGame = new Chess()
    newGame.loadPgn(game.pgn())
    try {
      const move = newGame.move({
        from: moveFrom,
        to: square,
        promotion: 'q'
      })
      if (move === null) throw new Error()
      
      setGame(newGame)
      setMoveFrom(null)
      setOptionSquares({})
    } catch {
      const hasMoveOptions = getMoveOptions(square)
      if (hasMoveOptions) setMoveFrom(square)
    }
  }

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Check for promotion
    const piece = game.get(sourceSquare as any)
    if (piece && piece.type === 'p' && (targetSquare[1] === '8' || targetSquare[1] === '1')) {
      const testGame = new Chess()
      testGame.loadPgn(game.pgn())
      try {
        const testMove = testGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q'
        })
        if (testMove) {
          setMoveFrom(sourceSquare)
          setMoveTo(targetSquare)
          setShowPromotionDialog(true)
          return true
        }
      } catch (e) {
        return false
      }
    }

    const newGame = new Chess()
    newGame.loadPgn(game.pgn())
    try {
      const move = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // default promotion for non-promotion moves, just safe
      })

      if (move === null) return false

      setGame(newGame)
      setMoveFrom(null)
      setOptionSquares({})

      return true
    } catch (e) {
      return false
    }
  }

  const onPromotionPieceSelect = (piece?: string) => {
    if (piece && moveFrom && moveTo) {
      const newGame = new Chess()
      newGame.loadPgn(game.pgn())
      
      const promotionPiece = piece[1].toLowerCase() ?? 'q'
      try {
        const move = newGame.move({
          from: moveFrom,
          to: moveTo,
          promotion: promotionPiece
        })

        if (move) {
          setGame(newGame)
        }
      } catch (e) {
        // Invalid move
      }
    }
    
    setMoveFrom(null)
    setMoveTo(null)
    setShowPromotionDialog(false)
    setOptionSquares({})
    return true
  }

  const resetGame = () => {
    console.log("resetGame")
    setGame(new Chess())
    setMoveFrom(null)
    setMoveTo(null)
    setShowPromotionDialog(false)
    setOptionSquares({})
  }

  const flipBoard = () => {
    console.log("flipBoard")
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')
  }

  const undoMove = () => {
    const newGame = new Chess()
    newGame.loadPgn(game.pgn())
    newGame.undo() // Undo AI's move
    newGame.undo() // Undo Player's move
    setGame(newGame)
    setMoveFrom(null)
    setOptionSquares({})
  }

  const getStatus = () => {
    if (game.isCheckmate()) return "Checkmate!"
    if (game.isDraw()) return "Draw"
    if (game.isStalemate()) return "Stalemate"
    if (game.isCheck()) return "Check!"
    const isPlayerTurn = (game.turn() === 'w' && playerColor === 'white') || 
                         (game.turn() === 'b' && playerColor === 'black')
    return isPlayerTurn ? "Player's turn" : "AI's turn"
  }

  const moveHistory = game.history({ verbose: true }) as Move[]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0f111a] to-[#1a1b26]">
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl w-full mx-auto relative z-10">
        
        {appState === 'menu' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 w-full max-w-[600px] mx-auto">
            <div className="glass-panel p-8 w-full flex flex-col items-center gap-8">
               <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                 Chess Game
               </h1>
               
               <div className="w-full space-y-6">
                 <div>
                   <h3 className="text-gray-300 font-semibold mb-3 flex items-center gap-2">
                     <User className="w-5 h-5 text-blue-400" />
                     Play As
                   </h3>
                   <div className="grid grid-cols-2 gap-3">
                     <button 
                       onClick={() => { setBoardOrientation('white'); setPlayerColor('white'); }} 
                       className={`py-3 rounded-lg font-medium transition-all ${playerColor === 'white' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'glass-button text-gray-300 hover:text-white'}`}
                     >
                       White
                     </button>
                     <button 
                       onClick={() => { setBoardOrientation('black'); setPlayerColor('black'); }} 
                       className={`py-3 rounded-lg font-medium transition-all ${playerColor === 'black' ? 'bg-gray-800 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-gray-600' : 'glass-button text-gray-300 hover:text-white'}`}
                     >
                       Black
                     </button>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-gray-300 font-semibold mb-3 flex items-center gap-2">
                     <Swords className="w-5 h-5 text-purple-400" />
                     AI Difficulty
                   </h3>
                   <div className="grid grid-cols-2 gap-3">
                     {['easy', 'medium', 'hard', 'expert'].map((lvl) => (
                       <button 
                         key={lvl} 
                         onClick={() => setDifficulty(lvl)} 
                         className={`py-3 rounded-lg font-medium uppercase text-sm transition-all ${difficulty === lvl ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'glass-button text-gray-400 hover:text-white'}`}
                       >
                         {lvl}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>

               <button 
                 onClick={startGame} 
                 className="w-full py-4 mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 rounded-xl font-bold text-lg text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
               >
                 <Play className="w-5 h-5" />
                 START GAME
               </button>
            </div>
          </div>
        ) : (
          <>
            {/* Left Column: Chess Board */}
            <div className="flex-1 flex flex-col items-center lg:items-end justify-center">
              <div className="glass-panel p-4 lg:p-6 w-full max-w-[600px]">
                {/* Player Info: AI */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                      <Monitor className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-200">AI Opponent</h3>
                      <p className="text-xs text-blue-400">Minimax α-β ({difficulty})</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {/* Captured pieces placeholder */}
                  </div>
                </div>

                <div className="rounded-md shadow-2xl border border-white/10">
                  <Chessboard 
                    position={game.fen()} 
                    onPieceDrop={onDrop}
                    onSquareClick={onSquareClick}
                    onPromotionPieceSelect={onPromotionPieceSelect}
                    promotionToSquare={moveTo ?? undefined}
                    showPromotionDialog={showPromotionDialog}
                    customSquareStyles={optionSquares}
                    boardOrientation={boardOrientation}
                    customDarkSquareStyle={{ backgroundColor: '#475569' }}
                    customLightSquareStyle={{ backgroundColor: '#cbd5e1' }}
                    customBoardStyle={{ borderRadius: '6px' }}
                    animationDuration={300}
                  />
                </div>

                {/* Player Info: You */}
                <div className="flex items-center justify-between mt-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <User className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-200">Player 1</h3>
                      <p className="text-xs text-emerald-400">Human</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="w-full lg:w-[400px] flex flex-col gap-6">
              
              {/* Status Panel */}
              <div className="glass-panel p-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                  Game Status
                </h2>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${game.turn() === 'w' ? 'bg-white' : 'bg-gray-500'}`} />
                  <span className="text-lg font-medium text-gray-300">{getStatus()}</span>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setAppState('menu')}
                    className="glass-button py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Main Menu
                  </button>
                  <button 
                    onClick={undoMove}
                    disabled={game.history().length === 0}
                    className="glass-button py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <History className="w-4 h-4" />
                    Undo
                  </button>
                  <button 
                    onClick={flipBoard}
                    className="glass-button col-span-2 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Flip Board
                  </button>
                </div>
              </div>

              {/* Move History */}
              <div className="glass-panel p-6 flex flex-col h-[300px] lg:h-[350px] shrink-0">
                <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2 shrink-0">
                  <History className="w-4 h-4" />
                  Move History
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 space-y-1 min-h-0">
                  {moveHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 italic text-center mt-10">No moves played yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      {moveHistory.reduce((result: any[], move: Move, index: number) => {
                        if (index % 2 === 0) {
                          result.push([move]);
                        } else {
                          result[result.length - 1].push(move);
                        }
                        return result;
                      }, []).map((pair: Move[], idx: number) => (
                        <div key={idx} className="col-span-2 grid grid-cols-[30px_1fr_1fr] items-center py-1 border-b border-white/5">
                          <span className="text-gray-500 font-mono">{idx + 1}.</span>
                          <span className="text-gray-300 font-medium pl-2">{pair[0]?.san}</span>
                          <span className="text-gray-300 font-medium pl-2">{pair[1]?.san || ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      {/* Game Over Modal */}
      {game.isGameOver() && appState === 'playing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-panel p-8 flex flex-col items-center gap-6 max-w-sm w-full mx-4 shadow-2xl scale-in-center">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 text-center">
              {game.isCheckmate() ? 'Checkmate!' : 'Draw!'}
            </h2>
            <p className="text-gray-300 text-lg text-center font-medium">
              {game.isCheckmate() 
                ? (((game.turn() === 'w' ? 'black' : 'white') === playerColor) ? 'Player wins the game!' : 'AI wins the game!')
                : 'The game ended in a draw.'}
            </p>
            <div className="flex gap-4 w-full mt-2">
              <button 
                onClick={resetGame}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-semibold text-white transition-all"
              >
                Rematch
              </button>
              <button 
                onClick={() => setAppState('menu')}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 rounded-xl font-semibold text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
