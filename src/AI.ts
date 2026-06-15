import { Chess } from 'chess.js'

/**
 * Hàm tính toán nước đi cho AI gọi lên Spring Boot Backend.
 */
export async function getBestMove(game: Chess, difficulty: string): Promise<string | null> {
  const possibleMoves = game.moves()
  if (possibleMoves.length === 0) return null

  // Quy đổi độ khó thành Depth cho C++ (Từ 2 đến 5)
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
    // Nếu Backend lỗi, ném lỗi ra ngoài thay vì đi ngẫu nhiên
    throw new Error("Không thể kết nối đến AI Engine.");
  }

  return null;
}
