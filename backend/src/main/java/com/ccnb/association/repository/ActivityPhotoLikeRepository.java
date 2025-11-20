package com.ccnb.association.repository;

import com.ccnb.association.entity.ActivityPhoto;
import com.ccnb.association.entity.ActivityPhotoLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityPhotoLikeRepository extends JpaRepository<ActivityPhotoLike, Long> {
    boolean existsByActivityPhotoAndVoterIp(ActivityPhoto activityPhoto, String voterIp);
    void deleteByActivityPhotoAndVoterIp(ActivityPhoto activityPhoto, String voterIp);
    Long countByActivityPhotoId(Long activityPhotoId);
}

