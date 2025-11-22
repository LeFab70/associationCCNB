package com.ccnb.association.service;

import com.ccnb.association.dto.CommentDTO;
import com.ccnb.association.entity.Comment;
import com.ccnb.association.entity.Review;
import com.ccnb.association.exceptions.ResourceNotFoundException;
import com.ccnb.association.repository.CommentRepository;
import com.ccnb.association.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    
    private final CommentRepository commentRepository;
    private final ReviewRepository reviewRepository;
    
    @Transactional
    public CommentDTO createComment(Long reviewId, String name, String commentText) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        
        Comment comment = new Comment();
        comment.setReview(review);
        comment.setName(name);
        comment.setCommentText(commentText);
        
        Comment savedComment = commentRepository.save(comment);
        return convertToDTO(savedComment);
    }
    
    @Transactional(readOnly = true)
    public List<CommentDTO> getCommentsByReviewId(Long reviewId) {
        return commentRepository.findByReviewIdOrderByCreatedAtDesc(reviewId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private CommentDTO convertToDTO(Comment comment) {
        return new CommentDTO(
            comment.getId(),
            comment.getName(),
            comment.getCommentText(),
            comment.getCreatedAt()
        );
    }
}

