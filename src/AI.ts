import { Chess } from 'chess.js'

// ==========================================
// BƯỚC 1: GIÁ TRỊ QUÂN CỜ & BẢNG VỊ TRÍ (PST)
// ==========================================

// 1. Giá trị cơ bản của từng loại quân (Material Values)
// Vua (k) có giá trị cực cao để AI không bao giờ để mất Vua.
const PIECE_VALUES: Record<string, number> = {
  p: 10,   // Tốt (Pawn)
  n: 30,   // Mã (Knight)
  b: 30,   // Tượng (Bishop)
  r: 50,   // Xe (Rook)
  q: 90,   // Hậu (Queen)
  k: 900   // Vua (King)
}

// 2. Bảng vị trí (Piece-Square Tables - PST)
// Các bảng này là ma trận 8x8 lật ngược (với góc nhìn của quân Trắng đi từ dưới lên).
// Số dương nghĩa là khuyến khích quân đứng ở đó, số âm là không nên.

const PAWN_EVAL = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, -20,-20, 10, 10,  5],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [0,  0,  0,  0,  0,  0,  0,  0]
]

const KNIGHT_EVAL = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
]

// Tạm thời các quân B, R, Q, K ta dùng mảng 0 để đơn giản hóa bài toán lúc đầu.
// Sau này có thể thêm mảng vị trí riêng cho Tượng, Xe, Hậu, Vua nếu cần AI thông minh hơn nữa.

/**
 * Hàm tính toán nước đi cho AI gọi lên Spring Boot Backend.
 */
export async function getBestMove(game: Chess, difficulty: string): Promise<string | null> {
  const possibleMoves = game.moves()
  if (possibleMoves.length === 0) return null

  // Quy đổi độ khó thành Depth cho C++ (Từ 1 đến 4)
  let depth = 3;
  if (difficulty === 'easy') depth = 2;
  if (difficulty === 'medium') depth = 3;
  if (difficulty === 'hard') depth = 4;
  if (difficulty === 'expert') depth = 5;

  try {
    // Gọi API sang Spring Boot Backend ở port 8080
    const response = await fetch(`http://localhost:8080/api/ai/move?fen=${encodeURIComponent(game.fen())}&depth=${depth}`)
    if (response.ok) {
      const data = await response.json()
      if (data.move) {
        return data.move; // Backend trả về nước đi định dạng LAN (vd: "e2e4")
      }
    }
  } catch (e) {
    console.error("Lỗi kết nối tới Backend Spring Boot:", e);
    console.warn("Đang dùng tạm Random AI vì Backend chưa được bật!");
  }

  // Backup: Nếu Backend sập hoặc chưa bật, tạm thời đi ngẫu nhiên để game không bị đơ
  const randomIndex = Math.floor(Math.random() * possibleMoves.length)
  return possibleMoves[randomIndex]
}
