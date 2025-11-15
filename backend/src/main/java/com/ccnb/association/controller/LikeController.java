package com.ccnb.association.controller;

import com.ccnb.association.service.LikeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LikeController {
    
    private final LikeService likeService;
    
    @PostMapping("/review/{reviewId}")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long reviewId,
            HttpServletRequest request) {
        
        String voterIp = getClientIpAddress(request);
        likeService.toggleLike(reviewId, voterIp);
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}

