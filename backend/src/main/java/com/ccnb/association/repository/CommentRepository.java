package com.ccnb.association.repository;

import com.ccnb.association.entity.Comment;
import com.ccnb.association.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    @Query("SELECT c FROM Comment c WHERE c.review.id = :reviewId ORDER BY c.createdAt DESC")
    List<Comment> findByReviewIdOrderByCreatedAtDesc(@Param("reviewId") Long reviewId);
    
    @Query("SELECT COUNT(c) FROM Comment c JOIN c.review r WHERE r.activity.id = :activityId")
    Long countByActivityId(@Param("activityId") Long activityId);
}

