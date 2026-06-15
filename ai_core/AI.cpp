#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include "thc.h"

using namespace std;

// ==========================================
// BƯỚC 1: GIÁ TRỊ QUÂN CỜ & BẢNG VỊ TRÍ (PST)
// ==========================================

const int PAWN_VAL = 100;
const int KNIGHT_VAL = 300;
const int BISHOP_VAL = 300;
const int ROOK_VAL = 500;
const int QUEEN_VAL = 900;

// Bảng vị trí cho quân Tốt (Trắng). Với Đen sẽ dùng mảng ngược lại.
const int pawn_pst[64] = {
      0,  0,  0,  0,  0,  0,  0,  0,
     50, 50, 50, 50, 50, 50, 50, 50,
     10, 10, 20, 30, 30, 20, 10, 10,
      5,  5, 10, 25, 25, 10,  5,  5,
      0,  0,  0, 20, 20,  0,  0,  0,
      5, -5,-10,  0,  0,-10, -5,  5,
      5, 10, 10,-20,-20, 10, 10,  5,
      0,  0,  0,  0,  0,  0,  0,  0
};

// Bảng vị trí cho quân Mã (Trắng)
const int knight_pst[64] = {
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
};

// Bảng vị trí cho quân Tượng (Trắng)
const int bishop_pst[64] = {
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
};

// Bảng vị trí cho quân Xe (Trắng)
const int rook_pst[64] = {
      0,  0,  0,  0,  0,  0,  0,  0,
      5, 10, 10, 10, 10, 10, 10,  5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
      0,  0,  0,  5,  5,  0,  0,  0
};

// Bảng vị trí cho quân Hậu (Trắng)
const int queen_pst[64] = {
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
};

// Bảng vị trí cho quân Vua (Trắng) - Dùng cho Khai cuộc và Giữa game (Trốn vào góc)
const int king_pst[64] = {
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20
};

// ==========================================
// BƯỚC 2: HÀM ĐÁNH GIÁ (EVALUATION FUNCTION)
// ==========================================
int Evaluate(const thc::ChessRules &cr) {
    int score = 0;
    for (int i = 0; i < 64; ++i) {
        char p = cr.squares[i];
        if (p == ' ' || p == '.') continue;
        
        int val = 0;
        int pst_val = 0;
        switch (p) {
            case 'P': val = PAWN_VAL; pst_val = pawn_pst[i]; break;
            case 'N': val = KNIGHT_VAL; pst_val = knight_pst[i]; break;
            case 'B': val = BISHOP_VAL; pst_val = bishop_pst[i]; break;
            case 'R': val = ROOK_VAL; pst_val = rook_pst[i]; break;
            case 'Q': val = QUEEN_VAL; pst_val = queen_pst[i]; break;
            case 'K': val = 10000; pst_val = king_pst[i]; break;
            // Với quân đen, lật ngược index của PST (63 - i)
            case 'p': val = -PAWN_VAL; pst_val = -pawn_pst[63-i]; break;
            case 'n': val = -KNIGHT_VAL; pst_val = -knight_pst[63-i]; break;
            case 'b': val = -BISHOP_VAL; pst_val = -bishop_pst[63-i]; break;
            case 'r': val = -ROOK_VAL; pst_val = -rook_pst[63-i]; break;
            case 'q': val = -QUEEN_VAL; pst_val = -queen_pst[63-i]; break;
            case 'k': val = -10000; pst_val = -king_pst[63-i]; break;
        }
        score += val + pst_val;
    }
    return score; // Điểm > 0 nghĩa là Trắng đang có lợi, < 0 là Đen đang có lợi
}

// ==========================================
// BƯỚC MỚI: TÌM KIẾM TĨNH (QUIESCENCE SEARCH)
// ==========================================
int QuiescenceSearch(thc::ChessRules &cr, int alpha, int beta, bool maximizingPlayer) {
    // FIX: Phải kiểm tra Chiếu hết trước khi đếm quân, nếu không AI sẽ mù Checkmate ở node lá!
    thc::TERMINAL terminal_score;
    cr.Evaluate(terminal_score);
    if (terminal_score == thc::TERMINAL_WCHECKMATE) return -100000;
    if (terminal_score == thc::TERMINAL_BCHECKMATE) return 100000;
    if (terminal_score == thc::TERMINAL_WSTALEMATE || terminal_score == thc::TERMINAL_BSTALEMATE) return 0;

    int stand_pat = Evaluate(cr); // Điểm số hiện tại (nếu không làm gì cả)
    
    if (maximizingPlayer) {
        if (stand_pat >= beta) return beta; // Cắt tỉa Beta
        if (alpha < stand_pat) alpha = stand_pat;
        
        vector<thc::Move> moves;
        cr.GenLegalMoveList(moves);
        
        // Sắp xếp ưu tiên nước ăn quân
        sort(moves.begin(), moves.end(), [&cr](const thc::Move &a, const thc::Move &b) {
            bool cap_a = (cr.squares[a.dst] != ' ' && cr.squares[a.dst] != '.');
            bool cap_b = (cr.squares[b.dst] != ' ' && cr.squares[b.dst] != '.');
            return cap_a > cap_b;
        });

        for (thc::Move m : moves) {
            // TRỌNG TÂM CỦA THUẬT TOÁN: Chỉ tính tiếp các nước ĂN QUÂN
            if (cr.squares[m.dst] == ' ' || cr.squares[m.dst] == '.') continue; 
            
            cr.PushMove(m);
            int eval = QuiescenceSearch(cr, alpha, beta, false);
            cr.PopMove(m);
            
            if (eval >= beta) return beta;
            if (eval > alpha) alpha = eval;
        }
        return alpha;
    } else {
        if (stand_pat <= alpha) return alpha; // Cắt tỉa Alpha
        if (beta > stand_pat) beta = stand_pat;
        
        vector<thc::Move> moves;
        cr.GenLegalMoveList(moves);
        
        // Sắp xếp ưu tiên nước ăn quân
        sort(moves.begin(), moves.end(), [&cr](const thc::Move &a, const thc::Move &b) {
            bool cap_a = (cr.squares[a.dst] != ' ' && cr.squares[a.dst] != '.');
            bool cap_b = (cr.squares[b.dst] != ' ' && cr.squares[b.dst] != '.');
            return cap_a > cap_b;
        });

        for (thc::Move m : moves) {
            // Chỉ tính tiếp các nước ĂN QUÂN
            if (cr.squares[m.dst] == ' ' || cr.squares[m.dst] == '.') continue;
            
            cr.PushMove(m);
            int eval = QuiescenceSearch(cr, alpha, beta, true);
            cr.PopMove(m);
            
            if (eval <= alpha) return alpha;
            if (eval < beta) beta = eval;
        }
        return beta;
    }
}

// ==========================================
// BƯỚC 4: THUẬT TOÁN MINIMAX ALPHA-BETA
// ==========================================
int Minimax(thc::ChessRules &cr, int depth, int alpha, int beta, bool maximizingPlayer) {
    // THAY ĐỔI: Chạm đáy Depth thì KHÔNG DỪNG LẠI, chuyển sang Quiescence Search
    if (depth <= 0) return QuiescenceSearch(cr, alpha, beta, maximizingPlayer);
    
    // 1. Kiểm tra trạng thái kết thúc (Chiếu hết / Hòa)
    thc::TERMINAL terminal_score;
    cr.Evaluate(terminal_score);
    // Nếu chiếu hết, trả về điểm cực lớn. Cộng thêm chiều sâu để AI ưu tiên chiếu hết nhanh nhất có thể.
    if (terminal_score == thc::TERMINAL_WCHECKMATE) return -100000 + (10 - depth); 
    if (terminal_score == thc::TERMINAL_BCHECKMATE) return 100000 - (10 - depth);
    if (terminal_score == thc::TERMINAL_WSTALEMATE || terminal_score == thc::TERMINAL_BSTALEMATE) return 0;
    
    // 2. Lấy danh sách nước đi hợp lệ
    vector<thc::Move> moves;
    cr.GenLegalMoveList(moves);
    if (moves.empty()) return maximizingPlayer ? -100000 : 100000;
    
    // 3. Move Ordering: Sắp xếp các nước đi ăn quân lên đầu để Cắt tỉa Alpha-Beta chạy nhanh hơn
    sort(moves.begin(), moves.end(), [&cr](const thc::Move &a, const thc::Move &b) {
        char target_a = cr.squares[a.dst];
        char target_b = cr.squares[b.dst];
        bool is_capture_a = (target_a != ' ' && target_a != '.');
        bool is_capture_b = (target_b != ' ' && target_b != '.');
        return is_capture_a > is_capture_b;
    });
    
    // 4. Lõi Minimax
    if (maximizingPlayer) { // Lượt của Trắng (Tìm max)
        int maxEval = -200000;
        for (thc::Move m : moves) {
            cr.PushMove(m); // Thử nước đi
            int eval = Minimax(cr, depth - 1, alpha, beta, false); // Đệ quy đổi lượt
            cr.PopMove(m); // Trả lại bàn cờ cũ
            
            maxEval = max(maxEval, eval);
            alpha = max(alpha, eval);
            if (beta <= alpha) break; // Cắt tỉa Beta
        }
        return maxEval;
    } else { // Lượt của Đen (Tìm min)
        int minEval = 200000;
        for (thc::Move m : moves) {
            cr.PushMove(m);
            int eval = Minimax(cr, depth - 1, alpha, beta, true);
            cr.PopMove(m);
            
            minEval = min(minEval, eval);
            beta = min(beta, eval);
            if (beta <= alpha) break; // Cắt tỉa Alpha
        }
        return minEval;
    }
}

// ==========================================
// BƯỚC 5: HÀM MAIN - ĐIỂM VÀO CỦA API
// ==========================================
int main(int argc, char* argv[]) {
    if (argc < 3) {
        cout << "Usage: AI.exe <FEN> <Depth>" << endl;
        return 1;
    }
    
    string fen = argv[1];
    int depth = stoi(argv[2]);
    
    thc::ChessRules cr;
    bool ok = cr.Forsyth(fen.c_str());
    if (!ok) {
        cout << "Error: Invalid FEN" << endl;
        return 1;
    }
    
    vector<thc::Move> moves;
    cr.GenLegalMoveList(moves);
    
    if (moves.empty()) {
        cout << "None" << endl;
        return 0;
    }
    
    // Move Ordering tại Node gốc
    sort(moves.begin(), moves.end(), [&cr](const thc::Move &a, const thc::Move &b) {
        bool cap_a = (cr.squares[a.dst] != ' ' && cr.squares[a.dst] != '.');
        bool cap_b = (cr.squares[b.dst] != ' ' && cr.squares[b.dst] != '.');
        return cap_a > cap_b;
    });
    
    bool isWhite = cr.white; // true nếu đến lượt trắng
    int bestVal = isWhite ? -200000 : 200000;
    int alpha = -200000;
    int beta = 200000;
    
    string bestMove = moves[0].TerseOut();
    
    for (thc::Move m : moves) {
        cr.PushMove(m);
        int val = Minimax(cr, depth - 1, alpha, beta, !isWhite);
        cr.PopMove(m);
        
        if (isWhite) { // Trắng đang tìm Max
            if (val > bestVal) {
                bestVal = val;
                bestMove = m.TerseOut(); 
            }
            alpha = max(alpha, bestVal); // Truyền Alpha cho các nhánh con để cắt tỉa
        } else { // Đen đang tìm Min
            if (val < bestVal) {
                bestVal = val;
                bestMove = m.TerseOut();
            }
            beta = min(beta, bestVal); // Truyền Beta cho các nhánh con để cắt tỉa
        }
    }
    
    // Trả kết quả ra Console để Spring Boot đọc
    cout << bestMove << endl;
    return 0;
}
