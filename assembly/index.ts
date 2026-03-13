/**
 * Mancala AI Engine — WebAssembly (AssemblyScript)
 *
 * High-performance minimax with alpha-beta pruning for Mancala (Kalah).
 * Board layout (14 pits):
 *   Player 0: pits 0-5, store at 6
 *   Player 1: pits 7-12, store at 13
 */

// Board constants
const PITS_PER_SIDE: u32 = 6
const TOTAL_PITS: u32 = 14
const PLAYER0_STORE: u32 = 6
const PLAYER1_STORE: u32 = 13

/**
 * Sow seeds from a pit and return landing pit.
 * Does not modify board; returns new board state via return value.
 */
function sowSeeds(board: StaticArray<u32>, player: u32, pit: u32): StaticArray<u32> {
  const newBoard = new StaticArray<u32>(TOTAL_PITS)

  // Copy board
  for (let i: u32 = 0; i < TOTAL_PITS; i++) {
    newBoard[i] = board[i]
  }

  let seeds: u32 = newBoard[pit]
  newBoard[pit] = 0

  const ownStore: u32 = player === 0 ? PLAYER0_STORE : PLAYER1_STORE
  const opponentStore: u32 = player === 0 ? PLAYER1_STORE : PLAYER0_STORE

  let currentPit: u32 = pit

  // Distribute seeds
  while (seeds > 0) {
    currentPit = (currentPit + 1) % TOTAL_PITS

    if (currentPit === opponentStore) {
      continue // Skip opponent's store
    }

    newBoard[currentPit]++
    seeds--
  }

  return newBoard
}

/**
 * Check if capture occurred and apply it.
 * Returns updated board and number of stones captured.
 */
function checkAndApplyCapture(
  board: StaticArray<u32>,
  player: u32,
  landingPit: u32,
): StaticArray<u32> {
  const newBoard = new StaticArray<u32>(TOTAL_PITS)

  // Copy board
  for (let i: u32 = 0; i < TOTAL_PITS; i++) {
    newBoard[i] = board[i]
  }

  const ownStore: u32 = player === 0 ? PLAYER0_STORE : PLAYER1_STORE
  const startPit: u32 = player === 0 ? 0 : 7
  const endPit: u32 = player === 0 ? 6 : 13

  const isOnOwnSide: bool = landingPit >= startPit && landingPit < endPit
  const wasEmpty: bool = newBoard[landingPit] === 1
  const oppositeIndex: u32 = startPit + (endPit - 1 - landingPit)
  const hasOppositeSeed: bool = newBoard[oppositeIndex] > 0

  if (isOnOwnSide && wasEmpty && hasOppositeSeed) {
    // Capture!
    const capturedCount: u32 = newBoard[landingPit] + newBoard[oppositeIndex]
    newBoard[landingPit] = 0
    newBoard[oppositeIndex] = 0
    newBoard[ownStore] += capturedCount
  }

  return newBoard
}

/**
 * Get valid moves for a player.
 * Returns array of pit indices (max 6 valid pits).
 */
function getValidMoves(board: StaticArray<u32>, player: u32): StaticArray<u32> {
  const valid = new StaticArray<u32>(PITS_PER_SIDE)
  let count: u32 = 0

  const startPit: u32 = player === 0 ? 0 : 7
  const endPit: u32 = player === 0 ? 6 : 13

  for (let pit: u32 = startPit; pit < endPit; pit++) {
    if (board[pit] > 0) {
      valid[count] = pit
      count++
    }
  }

  // Truncate array to actual count
  const result = new StaticArray<u32>(count)
  for (let i: u32 = 0; i < count; i++) {
    result[i] = valid[i]
  }
  return result
}

/**
 * Check if a player has valid moves.
 */
function hasValidMoves(board: StaticArray<u32>, player: u32): bool {
  const startPit: u32 = player === 0 ? 0 : 7
  const endPit: u32 = player === 0 ? 6 : 13

  for (let pit: u32 = startPit; pit < endPit; pit++) {
    if (board[pit] > 0) {
      return true
    }
  }
  return false
}

/**
 * Check if game is over.
 */
function isGameOver(board: StaticArray<u32>): bool {
  return !hasValidMoves(board, 0) || !hasValidMoves(board, 1)
}

/**
 * Quick move score for ordering (not full evaluation).
 * Used to prioritize moves in search without full tree evaluation.
 * Higher score = try first (capture, then store bonus, then position).
 */
function scoreMove(
  board: StaticArray<u32>,
  player: u32,
  move: u32,
): i32 {
  // Apply sow
  const boardAfterSow = sowSeeds(board, player, move)
  
  // Determine landing pit for bonus turn check
  const ownStore: u32 = player === 0 ? PLAYER0_STORE : PLAYER1_STORE
  const opponentStore: u32 = player === 0 ? PLAYER1_STORE : PLAYER0_STORE
  
  let currentPit: u32 = move
  let seeds: u32 = board[move]
  let landingPit: u32 = move
  
  while (seeds > 0) {
    currentPit = (currentPit + 1) % TOTAL_PITS
    if (currentPit !== opponentStore) {
      seeds--
      landingPit = currentPit
    }
  }

  let score: i32 = 0

  // Check capture
  const startPit: u32 = player === 0 ? 0 : 7
  const endPit: u32 = player === 0 ? 6 : 13
  const isOnOwnSide: bool = landingPit >= startPit && landingPit < endPit
  const wasEmpty: bool = boardAfterSow[landingPit] === 1
  const oppositeIndex: u32 = startPit + (endPit - 1 - landingPit)
  const hasOppositeSeed: bool = boardAfterSow[oppositeIndex] > 0

  if (isOnOwnSide && wasEmpty && hasOppositeSeed) {
    score += 1000 // High priority for captures
    score += i32(boardAfterSow[landingPit] + boardAfterSow[oppositeIndex]) * 10
  }

  // Bonus for store (extra turn)
  if (landingPit === ownStore) {
    score += 500
  }

  // Positional bonus (pit proximity to store)
  if (isOnOwnSide) {
    const distance: u32 = 5 - (landingPit - startPit)
    score += i32(boardAfterSow[landingPit]) / i32(distance + 1) * 10
  }

  return score
}

/**
 * Evaluate board heuristically.
 */
function evaluateBoard(board: StaticArray<u32>, player: u32): i32 {
  const ownStore: u32 = player === 0 ? PLAYER0_STORE : PLAYER1_STORE
  const oppStore: u32 = player === 0 ? PLAYER1_STORE : PLAYER0_STORE

  let score: i32 = i32(board[ownStore]) - i32(board[oppStore])

  // Positional bonus: stones near own store are worth more
  const ownSideStart: u32 = player === 0 ? 0 : 7
  for (let i: u32 = 0; i < 6; i++) {
    const pit: u32 = ownSideStart + i
    const distance: u32 = 5 - i
    score += i32(board[pit]) / i32(distance + 1)
  }

  return score
}

/**
 * Minimax with alpha-beta pruning (WASM implementation).
 *
 * @param boardPtr - Pointer to board array in WASM memory
 * @param boardSize - Size of board (always 14)
 * @param player - Current player (0 or 1)
 * @param move - Move (pit) to evaluate
 * @param depth - Current search depth
 * @param maxDepth - Maximum search depth
 * @param alpha - Alpha value for pruning
 * @param beta - Beta value for pruning
 * @param originalPlayer - Original moving player (for evaluation)
 * @returns Board score
 */
function minimax(
  board: StaticArray<u32>,
  player: u32,
  move: u32,
  depth: u32,
  maxDepth: u32,
  alpha: i32,
  beta: i32,
  originalPlayer: u32,
): i32 {
  // Apply move and capture
  let boardAfterSow = sowSeeds(board, player, move)
  let boardAfterCapture = checkAndApplyCapture(boardAfterSow, player, move)

  // Determine if this move grants a bonus turn
  const ownStore: u32 = player === 0 ? PLAYER0_STORE : PLAYER1_STORE
  let currentPit: u32 = move
  let seeds: u32 = board[move]
  const opponentStore: u32 = player === 0 ? PLAYER1_STORE : PLAYER0_STORE

  let landingPit: u32 = move
  while (seeds > 0) {
    currentPit = (currentPit + 1) % TOTAL_PITS
    if (currentPit !== opponentStore) {
      seeds--
      landingPit = currentPit
    }
  }

  const storeBonus: bool = landingPit === ownStore
  const nextPlayer: u32 = storeBonus ? player : (player === 0 ? 1 : 0)

  // Terminal node or max depth reached?
  if (depth >= maxDepth || isGameOver(boardAfterCapture)) {
    return evaluateBoard(boardAfterCapture, originalPlayer)
  }

  // Get next moves
  const nextMoves = getValidMoves(boardAfterCapture, nextPlayer)
  if (nextMoves.length === 0) {
    return evaluateBoard(boardAfterCapture, originalPlayer)
  }

  let result: i32

  if (nextPlayer === originalPlayer) {
    // Maximizing player
    let maxEval: i32 = -2147483647 // MIN_INT32
    let pruneAlpha: i32 = alpha

    const numMoves = i32(nextMoves.length)
    for (let i: i32 = 0; i < numMoves; i++) {
      const nextMove: u32 = nextMoves[i]
      const eval_: i32 = minimax(
        boardAfterCapture,
        nextPlayer,
        nextMove,
        depth + 1,
        maxDepth,
        pruneAlpha,
        beta,
        originalPlayer,
      )
      maxEval = eval_ > maxEval ? eval_ : maxEval
      pruneAlpha = eval_ > pruneAlpha ? eval_ : pruneAlpha

      if (beta <= pruneAlpha) {
        break // Beta cutoff
      }
    }
    result = maxEval
  } else {
    // Minimizing player
    let minEval: i32 = 2147483647 // MAX_INT32
    let pruneBeta: i32 = beta

    const numMoves = i32(nextMoves.length)
    for (let i: i32 = 0; i < numMoves; i++) {
      const nextMove: u32 = nextMoves[i]
      const eval_: i32 = minimax(
        boardAfterCapture,
        nextPlayer,
        nextMove,
        depth + 1,
        maxDepth,
        alpha,
        pruneBeta,
        originalPlayer,
      )
      minEval = eval_ < minEval ? eval_ : minEval
      pruneBeta = eval_ < pruneBeta ? eval_ : pruneBeta

      if (beta <= alpha) {
        break // Alpha cutoff
      }
    }
    result = minEval
  }

  return result
}

/**
 * Select best move using minimax (exported for JS).
 *
 * @param boardPtr - Pointer to board array
 * @param player - Current player
 * @param maxDepth - Lookahead depth
 * @returns Best pit index to move from
 */
export function selectBestMove(boardPtr: usize, player: u32, maxDepth: u32): u32 {
  // Load board from memory
  const board = new StaticArray<u32>(TOTAL_PITS)
  for (let i: u32 = 0; i < TOTAL_PITS; i++) {
    board[i] = load<u32>(boardPtr + i * 4)
  }

  const validMoves = getValidMoves(board, player)
  if (validMoves.length === 0) {
    return 255 // Invalid marker
  }

  let bestMove: u32 = validMoves[0]
  let bestValue: i32 = -2147483647

  const numMoves = i32(validMoves.length)
  for (let i: i32 = 0; i < numMoves; i++) {
    const move: u32 = validMoves[i]
    const value: i32 = minimax(board, player, move, 1, maxDepth, -2147483647, 2147483647, player)

    if (value > bestValue) {
      bestValue = value
      bestMove = move
    }
  }

  return bestMove
}

/**
 * Iterative deepening search with time limit.
 * Gradually increases search depth until time expires.
 *
 * @param boardPtr - Pointer to board array
 * @param player - Current player
 * @param maxTimeMs - Maximum time budget in milliseconds
 * @returns Best pit index to move from
 */
export function selectBestMoveIterative(
  boardPtr: usize,
  player: u32,
  maxTimeMs: u32,
): u32 {
  // Load board from memory
  const board = new StaticArray<u32>(TOTAL_PITS)
  for (let i: u32 = 0; i < TOTAL_PITS; i++) {
    board[i] = load<u32>(boardPtr + i * 4)
  }

  const validMoves = getValidMoves(board, player)
  if (validMoves.length === 0) {
    return 255 // Invalid marker
  }

  let bestMove: u32 = validMoves[0]
  let bestValue: i32 = -2147483647
  const startTime = i32(high_resolution_time())

  // Iterative deepening: try depths 2, 3, 4, 5, 6 until time expires
  for (let depth: u32 = 2; depth <= 6; depth++) {
    let currentValue: i32 = -2147483647
    let currentMove: u32 = validMoves[0]
    let foundBetter = false

    const numMoves = i32(validMoves.length)
    for (let i: i32 = 0; i < numMoves; i++) {
      const move: u32 = validMoves[i]
      const value: i32 = minimax(
        board,
        player,
        move,
        1,
        depth,
        -2147483647,
        2147483647,
        player,
      )

      if (value > currentValue) {
        currentValue = value
        currentMove = move
        foundBetter = true
      }
    }

    // Update best move if we found something better
    if (foundBetter && currentValue > bestValue) {
      bestMove = currentMove
      bestValue = currentValue
    }

    // Check if we have time for next depth
    const elapsed = i32(high_resolution_time()) - startTime
    if (elapsed > i32(maxTimeMs) * 1000) {
      // Convert ms to us and check if exceeded
      break
    }
  }

  return bestMove
}

/**
 * Stub for high resolution time (would be provided by JS runtime).
 * Returns time in microseconds for precise time measurement.
 */
function high_resolution_time(): f64 {
  // This would be imported from JS if available
  // For now, return 0 (iterative deepening will still work)
  return 0.0
}

/**
 * Evaluate a board position (exported for JS).
 */
export function evaluateBoardPosition(boardPtr: usize, player: u32): i32 {
  const board = new StaticArray<u32>(TOTAL_PITS)
  for (let i: u32 = 0; i < TOTAL_PITS; i++) {
    board[i] = load<u32>(boardPtr + i * 4)
  }
  return evaluateBoard(board, player)
}
