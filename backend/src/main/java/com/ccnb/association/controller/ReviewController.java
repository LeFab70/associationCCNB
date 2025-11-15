package com.ccnb.association.controller;

import com.ccnb.association.dto.ReviewDTO;
import com.ccnb.association.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {
    
    private final ReviewService reviewService;
    
    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(
            @RequestParam("name") String name,
            @RequestParam("reviewText") String reviewText,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {
        
        ReviewDTO review = reviewService.createReview(name, reviewText, photo);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }
    
    @GetMapping
    public ResponseEntity<List<ReviewDTO>> getAllApprovedReviews(HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        List<ReviewDTO> reviews = reviewService.getAllApprovedReviews(voterIp);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/admin")
    public ResponseEntity<List<ReviewDTO>> getAllReviews(HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        List<ReviewDTO> reviews = reviewService.getAllReviews(voterIp);
        return ResponseEntity.ok(reviews);
    }
    
    @PutMapping("/{id}/approval")
    public ResponseEntity<ReviewDTO> toggleApproval(@PathVariable Long id) {
        reviewService.toggleApproval(id);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
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

