package com.ccnb.association.service;

import com.ccnb.association.entity.Like;
import com.ccnb.association.entity.Review;
import com.ccnb.association.exceptions.ResourceNotFoundException;
import com.ccnb.association.repository.LikeRepository;
import com.ccnb.association.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {
    
    private final LikeRepository likeRepository;
    private final ReviewRepository reviewRepository;
    
    @Transactional
    public void toggleLike(Long reviewId, String voterIp) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        
        if (likeRepository.existsByReviewAndVoterIp(review, voterIp)) {
            likeRepository.deleteByReviewAndVoterIp(review, voterIp);
        } else {
            Like like = new Like();
            like.setReview(review);
            like.setVoterIp(voterIp);
            likeRepository.save(like);
        }
    }
    
    @Transactional(readOnly = true)
    public boolean hasLiked(Long reviewId, String voterIp) {
        return reviewRepository.findById(reviewId)
                .map(review -> likeRepository.existsByReviewAndVoterIp(review, voterIp))
                .orElse(false);
    }
}

