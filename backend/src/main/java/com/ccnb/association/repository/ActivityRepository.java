package com.ccnb.association.repository;

import com.ccnb.association.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    
    // Activités publiées (confirmées) et actives - pour les utilisateurs
    @Query("SELECT a FROM Activity a WHERE a.isPublished = true AND a.isActive = true ORDER BY a.createdAt DESC")
    List<Activity> findAllPublishedAndActiveOrderByCreatedAtDesc();
    
    // Activités proposées (en attente de vote) - pour les utilisateurs
    @Query("SELECT a FROM Activity a WHERE (a.isPublished = false OR a.isPublished IS NULL) AND a.isActive = true ORDER BY a.createdAt DESC")
    List<Activity> findAllProposedAndActiveOrderByCreatedAtDesc();
    
    // Toutes les activités actives - pour les utilisateurs (proposées + publiées)
    @Query("SELECT a FROM Activity a WHERE a.isActive = true ORDER BY a.createdAt DESC")
    List<Activity> findAllActiveOrderByCreatedAtDesc();
    
    // Toutes les activités (pour l'admin)
    @Query("SELECT a FROM Activity a ORDER BY a.createdAt DESC")
    List<Activity> findAllOrderByCreatedAtDesc();
    
    // Activités proposées uniquement (pour l'admin)
    @Query("SELECT a FROM Activity a WHERE (a.isPublished = false) OR (a.isPublished IS NULL) ORDER BY a.createdAt DESC")
    List<Activity> findAllProposedOrderByCreatedAtDesc();
    
    // Activités publiées uniquement (pour l'admin)
    @Query("SELECT a FROM Activity a WHERE a.isPublished = true ORDER BY a.createdAt DESC")
    List<Activity> findAllPublishedOrderByCreatedAtDesc();
    
    // Activités passées (pour permettre l'ajout de photos) - pour l'admin
    // Inclut les activités avec date passée OU isActive = false
    @Query("SELECT a FROM Activity a WHERE (a.dateActivite IS NOT NULL AND a.dateActivite < CURRENT_DATE) OR (a.isActive = false OR a.isActive IS NULL) ORDER BY COALESCE(a.dateActivite, a.createdAt) DESC")
    List<Activity> findPastActivitiesOrderByDateDesc();
    
    // Activités passées (isActive = false) - pour les étudiants
    @Query("SELECT a FROM Activity a WHERE a.isActive = false ORDER BY a.createdAt DESC")
    List<Activity> findInactiveActivitiesOrderByCreatedAtDesc();
}

