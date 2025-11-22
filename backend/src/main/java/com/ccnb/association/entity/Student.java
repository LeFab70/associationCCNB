package com.ccnb.association.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email; // Email avec @monccnb.ca
    
    @Column(nullable = true) // Nullable car rempli à l'étape 2 de la création du profil
    private String nom;
    
    @Column(name = "prenom")
    private String prenom; // Optionnel
    
    @Column(name = "filiere")
    private String filiere; // Filière de l'étudiant
    
    @Column(name = "campus")
    private String campus; // Campus de l'étudiant
    
    @Column(name = "password")
    private String password; // Mot de passe hashé (SHA-256)
    
    @Column(name = "validation_code")
    private String validationCode; // Code de validation envoyé par email
    
    @Column(name = "code_expires_at")
    private LocalDateTime codeExpiresAt; // Date d'expiration du code (15 minutes)
    
    @Column(name = "password_reset_code")
    private String passwordResetCode; // Code de réinitialisation de mot de passe
    
    @Column(name = "password_reset_expires_at")
    private LocalDateTime passwordResetExpiresAt; // Date d'expiration du code de réinitialisation (30 minutes)
    
    @Column(name = "email_verified")
    private Boolean emailVerified = false; // Email vérifié ou non
    
    @Column(name = "is_active")
    private Boolean isActive = true; // Compte actif ou non
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
        if (emailVerified == null) {
            emailVerified = false;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

