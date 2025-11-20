package com.ccnb.association.controller;

import com.ccnb.association.dto.ActivityPhotoCommentDTO;
import com.ccnb.association.service.ActivityPhotoCommentService;
import com.ccnb.association.service.ActivityPhotoLikeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activity-photos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ActivityPhotoController {
    
    private final ActivityPhotoLikeService likeService;
    private final ActivityPhotoCommentService commentService;
    
    @PostMapping("/{photoId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long photoId, HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        likeService.toggleLike(photoId, voterIp);
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    @PostMapping("/{photoId}/comments")
    public ResponseEntity<ActivityPhotoCommentDTO> createComment(
            @PathVariable Long photoId,
            @RequestBody Map<String, String> requestBody,
            HttpServletRequest request) {
        String name = requestBody.get("name");
        String commentText = requestBody.get("commentText");
        
        ActivityPhotoCommentDTO comment = commentService.createComment(photoId, name, commentText);
        return ResponseEntity.ok(comment);
    }
    
    @GetMapping("/{photoId}/comments")
    public ResponseEntity<List<ActivityPhotoCommentDTO>> getComments(@PathVariable Long photoId) {
        // Pour les étudiants : seulement les commentaires approuvés
        List<ActivityPhotoCommentDTO> comments = commentService.getCommentsByPhotoId(photoId, false);
        return ResponseEntity.ok(comments);
    }
    
    @GetMapping("/admin/{photoId}/comments")
    public ResponseEntity<List<ActivityPhotoCommentDTO>> getCommentsForAdmin(@PathVariable Long photoId) {
        // Pour l'admin : tous les commentaires
        List<ActivityPhotoCommentDTO> comments = commentService.getCommentsByPhotoId(photoId, true);
        return ResponseEntity.ok(comments);
    }
    
    @GetMapping("/admin/comments/pending")
    public ResponseEntity<List<ActivityPhotoCommentDTO>> getPendingComments() {
        List<ActivityPhotoCommentDTO> comments = commentService.getAllPendingComments();
        return ResponseEntity.ok(comments);
    }
    
    @PutMapping("/admin/comments/{commentId}/approve")
    public ResponseEntity<Map<String, Object>> approveComment(@PathVariable Long commentId) {
        commentService.approveComment(commentId);
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    @PutMapping("/admin/comments/{commentId}/reject")
    public ResponseEntity<Map<String, Object>> rejectComment(@PathVariable Long commentId) {
        commentService.rejectComment(commentId);
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    @DeleteMapping("/admin/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

