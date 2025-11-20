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
    
    @GetMapping("/activity/{activityId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByActivityId(
            @PathVariable Long activityId,
            HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        List<ReviewDTO> reviews = reviewService.getReviewsByActivityId(activityId, voterIp);
        return ResponseEntity.ok(reviews);
    }
    
    @PostMapping("/activity/{activityId}")
    public ResponseEntity<ReviewDTO> createReview(
            @PathVariable Long activityId,
            @RequestParam("name") String name,
            @RequestParam("reviewText") String reviewText,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {
        
        ReviewDTO review = reviewService.createReview(activityId, name, reviewText, photo);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }
    
    // Endpoint réservé aux admins pour créer des reviews/photos
    @PostMapping("/admin/activity/{activityId}")
    public ResponseEntity<ReviewDTO> createReviewAsAdmin(
            @PathVariable Long activityId,
            @RequestParam("name") String name,
            @RequestParam("reviewText") String reviewText,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {
        
        // Les reviews créées par les admins sont automatiquement approuvées
        ReviewDTO review = reviewService.createReviewAsAdmin(activityId, name, reviewText, photo);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }
    
    @GetMapping("/admin")
    public ResponseEntity<List<ReviewDTO>> getAllReviewsForAdmin(HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        List<ReviewDTO> reviews = reviewService.getAllReviewsForAdmin(voterIp);
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

