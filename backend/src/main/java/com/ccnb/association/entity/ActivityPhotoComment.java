package com.ccnb.association.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_photo_comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityPhotoComment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_photo_id", nullable = false)
    private ActivityPhoto activityPhoto;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String commentText;
    
    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = false; // Par défaut, non approuvé
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isApproved == null) {
            isApproved = false;
        }
    }
    
    @PostLoad
    protected void onLoad() {
        if (isApproved == null) {
            isApproved = false;
        }
    }
}

