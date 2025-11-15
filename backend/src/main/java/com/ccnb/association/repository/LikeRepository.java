package com.ccnb.association.repository;

import com.ccnb.association.entity.Like;
import com.ccnb.association.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByReviewAndVoterIp(Review review, String voterIp);
    void deleteByReviewAndVoterIp(Review review, String voterIp);
}

