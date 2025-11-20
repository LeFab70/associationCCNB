package com.ccnb.association.repository;

import com.ccnb.association.entity.Activity;
import com.ccnb.association.entity.ActivityPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityPhotoRepository extends JpaRepository<ActivityPhoto, Long> {
    
    @Query("SELECT ap FROM ActivityPhoto ap WHERE ap.activity.id = :activityId ORDER BY ap.displayOrder ASC, ap.createdAt ASC")
    List<ActivityPhoto> findByActivityIdOrderByDisplayOrder(@Param("activityId") Long activityId);
    
    void deleteByActivity(Activity activity);
}

