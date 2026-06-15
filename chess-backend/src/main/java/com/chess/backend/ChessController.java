package com.chess.backend;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.File;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*") // Cho phép React gọi API mà không bị chặn CORS
public class ChessController {

    @GetMapping("/move")
    public String getBestMove(@RequestParam String fen, @RequestParam int depth) {
        try {
            // Thử 2 đường dẫn để hỗ trợ chạy từ thư mục root hoặc thư mục chess-backend
            String aiExecutable = ".." + File.separator + "ai_core" + File.separator + "AI.exe";
            if (!new File(aiExecutable).exists()) {
                aiExecutable = "ai_core" + File.separator + "AI.exe";
            }
            if (!new File(aiExecutable).exists()) {
                // Đường dẫn tuyệt đối an toàn
                aiExecutable = "D:\\HUST\\AI_INTRO\\ChessGame\\ai_core\\AI.exe";
            }
            
            // Xây dựng lệnh gọi Terminal: AI.exe "chuỗi FEN" depth
            ProcessBuilder processBuilder = new ProcessBuilder(aiExecutable, fen, String.valueOf(depth));
            Process process = processBuilder.start();

            // Đọc kết quả in ra từ AI.exe
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String bestMove = reader.readLine();

            int exitCode = process.waitFor();
            if (exitCode == 0 && bestMove != null && !bestMove.isEmpty()) {
                return "{\"move\": \"" + bestMove.trim() + "\"}"; // Trả về dạng JSON
            } else {
                return "{\"error\": \"AI failed to calculate move\"}";
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }
}
