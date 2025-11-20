package com.ccnb.association.repository;

import com.ccnb.association.entity.ActivityPhotoComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityPhotoCommentRepository extends JpaRepository<ActivityPhotoComment, Long> {
    // Pour les étudiants : seulement les commentaires approuvés
    @Query("SELECT c FROM ActivityPhotoComment c WHERE c.activityPhoto.id = :photoId AND c.isApproved = true ORDER BY c.createdAt DESC")
    List<ActivityPhotoComment> findApprovedByActivityPhotoIdOrderByCreatedAtDesc(@Param("photoId") Long photoId);
    
    // Pour l'admin : tous les commentaires
    @Query("SELECT c FROM ActivityPhotoComment c WHERE c.activityPhoto.id = :photoId ORDER BY c.createdAt DESC")
    List<ActivityPhotoComment> findByActivityPhotoIdOrderByCreatedAtDesc(@Param("photoId") Long photoId);
    
    // Tous les commentaires en attente de modération
    @Query("SELECT c FROM ActivityPhotoComment c WHERE (c.isApproved = false) OR (c.isApproved IS NULL) ORDER BY c.createdAt DESC")
    List<ActivityPhotoComment> findAllPendingOrderByCreatedAtDesc();
}

