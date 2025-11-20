package com.ccnb.association.repository;

import com.ccnb.association.entity.Activity;
import com.ccnb.association.entity.ActivityLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActivityLikeRepository extends JpaRepository<ActivityLike, Long> {
    
    Optional<ActivityLike> findByActivityAndVoterIp(Activity activity, String voterIp);
    
    boolean existsByActivityAndVoterIp(Activity activity, String voterIp);
    
    @Query("SELECT COUNT(al) FROM ActivityLike al WHERE al.activity.id = :activityId")
    Long countByActivityId(@Param("activityId") Long activityId);
    
    @Query("SELECT COUNT(al) FROM ActivityLike al WHERE al.activity.id = :activityId AND al.voterIp = :voterIp")
    Long countByActivityIdAndVoterIp(@Param("activityId") Long activityId, @Param("voterIp") String voterIp);
}

