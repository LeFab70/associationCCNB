package com.ccnb.association.repository;

import com.ccnb.association.entity.Activity;
import com.ccnb.association.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    @Query("SELECT r FROM Review r WHERE r.activity.id = :activityId AND r.isApproved = true ORDER BY r.createdAt DESC")
    List<Review> findByActivityIdAndApproved(@Param("activityId") Long activityId);
    
    @Query("SELECT r FROM Review r WHERE r.activity.id = :activityId ORDER BY r.createdAt DESC")
    List<Review> findByActivityId(@Param("activityId") Long activityId);
    
    @Query("SELECT r FROM Review r WHERE r.isApproved = true ORDER BY r.createdAt DESC")
    List<Review> findAllApprovedOrderByCreatedAtDesc();
    
    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.activity ORDER BY r.createdAt DESC")
    List<Review> findAllOrderByCreatedAtDesc();
}

