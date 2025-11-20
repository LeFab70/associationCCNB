package com.ccnb.association.service;

import com.ccnb.association.dto.ReviewDTO;
import com.ccnb.association.entity.Activity;
import com.ccnb.association.entity.Review;
import com.ccnb.association.repository.ActivityRepository;
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
    private final ActivityRepository activityRepository;
    private final FileStorageService fileStorageService;
    private final LikeRepository likeRepository;
    
    @Transactional
    public ReviewDTO createReview(Long activityId, String name, String reviewText, MultipartFile photo) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        Review review = new Review();
        review.setActivity(activity);
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
    
    @Transactional
    public ReviewDTO createReviewAsAdmin(Long activityId, String name, String reviewText, MultipartFile photo) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        Review review = new Review();
        review.setActivity(activity);
        review.setName(name);
        review.setReviewText(reviewText);
        review.setIsApproved(true); // Les reviews créées par les admins sont automatiquement approuvées
        
        if (photo != null && !photo.isEmpty()) {
            String fileName = fileStorageService.storeFile(photo);
            review.setPhotoUrl(fileName);
        }
        
        Review savedReview = reviewRepository.save(review);
        return convertToDTO(savedReview, null);
    }
    
    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewsByActivityId(Long activityId, String voterIp) {
        // Retourner tous les avis (approuvés et en attente) pour que les étudiants puissent voir leurs propres avis
        return reviewRepository.findByActivityId(activityId).stream()
                .map(review -> convertToDTO(review, voterIp))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ReviewDTO> getAllReviewsForAdmin(String voterIp) {
        List<Review> reviews = reviewRepository.findAllOrderByCreatedAtDesc();
        // Vérifier que les activités sont bien chargées
        for (Review review : reviews) {
            if (review.getActivity() == null) {
                System.err.println("WARNING: Review " + review.getId() + " n'a pas d'activité associée!");
            } else {
                System.out.println("Review " + review.getId() + " associée à l'activité: " + review.getActivity().getTitle() + " (ID: " + review.getActivity().getId() + ")");
            }
        }
        return reviews.stream()
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
        Activity activity = review.getActivity();
        
        // Log pour déboguer
        if (activity == null) {
            System.err.println("ERREUR: Review " + review.getId() + " n'a pas d'activité chargée!");
        }
        
        return new ReviewDTO(
            review.getId(),
            review.getName(),
            review.getReviewText(),
            review.getPhotoUrl(),
            review.getCreatedAt(),
            review.getIsApproved(),
            review.getLikeCount(),
            hasLiked,
            activity != null ? activity.getId() : null,
            activity != null ? activity.getTitle() : null
        );
    }
}

