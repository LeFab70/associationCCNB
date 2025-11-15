package com.ccnb.association.service;

import com.ccnb.association.dto.ReviewDTO;
import com.ccnb.association.entity.Review;
import com.ccnb.association.repository.LikeRepository;
import com.ccnb.association.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final FileStorageService fileStorageService;
    private final LikeRepository likeRepository;
    
    @Transactional
    public ReviewDTO createReview(String name, String reviewText, MultipartFile photo) {
        Review review = new Review();
        review.setName(name);
        review.setReviewText(reviewText);
        review.setIsApproved(false); // Les nouveaux avis doivent être approuvés par l'admin
        
        if (photo != null && !photo.isEmpty()) {
            String fileName = fileStorageService.storeFile(photo);
            review.setPhotoUrl(fileName);
        }
        
        Review savedReview = reviewRepository.save(review);
        return convertToDTO(savedReview, null);
    }
    
    @Transactional(readOnly = true)
    public List<ReviewDTO> getAllApprovedReviews(String voterIp) {
        return reviewRepository.findAllApprovedOrderByCreatedAtDesc().stream()
                .map(review -> convertToDTO(review, voterIp))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ReviewDTO> getAllReviews(String voterIp) {
        return reviewRepository.findAllOrderByCreatedAtDesc().stream()
                .map(review -> convertToDTO(review, voterIp))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void toggleApproval(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setIsApproved(!review.getIsApproved());
        reviewRepository.save(review);
    }
    
    @Transactional
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
    
    private ReviewDTO convertToDTO(Review review, String voterIp) {
        boolean hasLiked = voterIp != null && likeRepository.existsByReviewAndVoterIp(review, voterIp);
        return new ReviewDTO(
            review.getId(),
            review.getName(),
            review.getReviewText(),
            review.getPhotoUrl(),
            review.getCreatedAt(),
            review.getIsApproved(),
            review.getLikeCount(),
            hasLiked
        );
    }
}

