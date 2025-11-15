package com.ccnb.association.controller;

import com.ccnb.association.dto.CommentDTO;
import com.ccnb.association.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommentController {
    
    private final CommentService commentService;
    
    @PostMapping("/review/{reviewId}")
    public ResponseEntity<CommentDTO> createComment(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> request) {
        
        String name = request.get("name");
        String commentText = request.get("commentText");
        
        CommentDTO comment = commentService.createComment(reviewId, name, commentText);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }
    
    @GetMapping("/review/{reviewId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByReviewId(@PathVariable Long reviewId) {
        List<CommentDTO> comments = commentService.getCommentsByReviewId(reviewId);
        return ResponseEntity.ok(comments);
    }
}

