package com.ccnb.association.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String programme; // Programme détaillé de l'activité
    
    @Column(name = "lieu")
    private String lieu; // Lieu de l'activité
    
    @Column(name = "date_activite")
    private java.time.LocalDate dateActivite; // Date de l'activité
    
    @Column(name = "heure_activite")
    private String heureActivite; // Heure de l'activité (ex: "14:00")
    
    @Column(name = "is_free")
    private Boolean isFree = true; // Gratuit ou payant
    
    @Column(name = "prix")
    private Double prix; // Prix si payant
    
    @Column(name = "reservation_required")
    private Boolean reservationRequired = false; // Réservation requise ou non
    
    @Column(name = "reservation_url")
    private String reservationUrl; // URL de réservation
    
    @Column(name = "image_url")
    private String imageUrl; // Photo principale (pour compatibilité)
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "is_published")
    private Boolean isPublished = false; // false = proposée (en attente de vote), true = publiée (confirmée)
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ActivityLike> likes = new ArrayList<>();
    
    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();
    
    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ActivityPhoto> photos = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
        if (isFree == null) {
            isFree = true;
        }
        if (reservationRequired == null) {
            reservationRequired = false;
        }
        if (isPublished == null) {
            isPublished = false; // Par défaut, les nouvelles activités sont proposées (non publiées)
        }
    }
    
    @PostLoad
    protected void onLoad() {
        // S'assurer que les valeurs par défaut sont définies pour les activités existantes
        if (isFree == null) {
            isFree = true;
        }
        if (reservationRequired == null) {
            reservationRequired = false;
        }
        if (isActive == null) {
            isActive = true;
        }
        if (isPublished == null) {
            isPublished = false; // Par défaut, les activités existantes sont proposées
        }
    }
    
    public int getLikeCount() {
        return likes != null ? likes.size() : 0;
    }
}

