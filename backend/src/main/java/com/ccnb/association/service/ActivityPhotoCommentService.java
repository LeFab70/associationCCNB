package com.ccnb.association.service;

import com.ccnb.association.dto.ActivityPhotoCommentDTO;
import com.ccnb.association.entity.ActivityPhoto;
import com.ccnb.association.entity.ActivityPhotoComment;
import com.ccnb.association.repository.ActivityPhotoCommentRepository;
import com.ccnb.association.repository.ActivityPhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityPhotoCommentService {
    
    private final ActivityPhotoCommentRepository commentRepository;
    private final ActivityPhotoRepository photoRepository;
    
    @Transactional
    public ActivityPhotoCommentDTO createComment(Long photoId, String name, String commentText) {
        ActivityPhoto photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Activity photo not found"));
        
        ActivityPhotoComment comment = new ActivityPhotoComment();
        comment.setActivityPhoto(photo);
        comment.setName(name);
        comment.setCommentText(commentText);
        comment.setIsApproved(false); // Nouveau commentaire est non approuvé par défaut
        
        ActivityPhotoComment savedComment = commentRepository.save(comment);
        return convertToDTO(savedComment);
    }
    
    @Transactional(readOnly = true)
    public List<ActivityPhotoCommentDTO> getCommentsByPhotoId(Long photoId, boolean forAdmin) {
        List<ActivityPhotoComment> comments;
        if (forAdmin) {
            // Pour l'admin : tous les commentaires
            comments = commentRepository.findByActivityPhotoIdOrderByCreatedAtDesc(photoId);
        } else {
            // Pour les étudiants : seulement les commentaires approuvés
            comments = commentRepository.findApprovedByActivityPhotoIdOrderByCreatedAtDesc(photoId);
        }
        return comments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ActivityPhotoCommentDTO> getAllPendingComments() {
        return commentRepository.findAllPendingOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void approveComment(Long commentId) {
        ActivityPhotoComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setIsApproved(true);
        commentRepository.save(comment);
    }
    
    @Transactional
    public void rejectComment(Long commentId) {
        ActivityPhotoComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setIsApproved(false);
        commentRepository.save(comment);
    }
    
    @Transactional
    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }
    
    private ActivityPhotoCommentDTO convertToDTO(ActivityPhotoComment comment) {
        return new ActivityPhotoCommentDTO(
            comment.getId(),
            comment.getName(),
            comment.getCommentText(),
            comment.getCreatedAt(),
            comment.getIsApproved() != null ? comment.getIsApproved() : false
        );
    }
}

