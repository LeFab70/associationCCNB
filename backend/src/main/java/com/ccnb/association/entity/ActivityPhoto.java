package com.ccnb.association.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "activity_photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityPhoto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;
    
    @Column(name = "photo_url", nullable = false)
    private String photoUrl;
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "activityPhoto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ActivityPhotoLike> likes = new ArrayList<>();
    
    @OneToMany(mappedBy = "activityPhoto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ActivityPhotoComment> comments = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (displayOrder == null) {
            displayOrder = 0;
        }
    }
    
    public int getLikeCount() {
        return likes != null ? likes.size() : 0;
    }
}

