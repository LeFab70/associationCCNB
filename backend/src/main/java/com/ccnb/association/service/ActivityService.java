package com.ccnb.association.service;

import com.ccnb.association.dto.ActivityDTO;
import com.ccnb.association.dto.ActivityPhotoDTO;
import com.ccnb.association.entity.Activity;
import com.ccnb.association.entity.ActivityLike;
import com.ccnb.association.entity.ActivityPhoto;
import com.ccnb.association.repository.ActivityLikeRepository;
import com.ccnb.association.repository.ActivityPhotoRepository;
import com.ccnb.association.repository.ActivityPhotoLikeRepository;
import com.ccnb.association.repository.ActivityPhotoCommentRepository;
import com.ccnb.association.repository.ActivityRepository;
import com.ccnb.association.repository.CommentRepository;
import com.ccnb.association.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {
    
    private final ActivityRepository activityRepository;
    private final ActivityLikeRepository activityLikeRepository;
    private final ActivityPhotoRepository activityPhotoRepository;
    private final ActivityPhotoLikeRepository activityPhotoLikeRepository;
    private final ActivityPhotoCommentRepository activityPhotoCommentRepository;
    private final ReviewRepository reviewRepository;
    private final CommentRepository commentRepository;
    private final FileStorageService fileStorageService;
    
    @Transactional
    public ActivityDTO createActivity(String title, String description, String programme, String lieu, 
                                     java.time.LocalDate dateActivite, String heureActivite, 
                                     Boolean isFree, Double prix, Boolean reservationRequired, 
                                     String reservationUrl, MultipartFile image, String imageUrl, 
                                     List<MultipartFile> photos) {
        Activity activity = new Activity();
        activity.setTitle(title);
        activity.setDescription(description);
        activity.setProgramme(programme);
        activity.setLieu(lieu);
        activity.setDateActivite(dateActivite);
        activity.setHeureActivite(heureActivite);
        activity.setIsFree(isFree != null ? isFree : true);
        activity.setPrix(prix);
        activity.setReservationRequired(reservationRequired != null ? reservationRequired : false);
        activity.setReservationUrl(reservationUrl);
        
        if (image != null && !image.isEmpty()) {
            String fileName = fileStorageService.storeFile(image);
            activity.setImageUrl(fileName);
        } else if (imageUrl != null && !imageUrl.isEmpty()) {
            activity.setImageUrl(imageUrl);
        }
        
        Activity savedActivity = activityRepository.save(activity);
        
        // Ajouter les photos supplémentaires
        if (photos != null && !photos.isEmpty()) {
            int order = 0;
            for (MultipartFile photo : photos) {
                if (photo != null && !photo.isEmpty()) {
                    String fileName = fileStorageService.storeFile(photo);
                    ActivityPhoto activityPhoto = new ActivityPhoto();
                    activityPhoto.setActivity(savedActivity);
                    activityPhoto.setPhotoUrl(fileName);
                    activityPhoto.setDisplayOrder(order++);
                    activityPhotoRepository.save(activityPhoto);
                }
            }
        }
        
        return convertToDTO(savedActivity, null);
    }
    
    @Transactional
    public ActivityPhotoDTO addPhotoToActivity(Long activityId, MultipartFile photo, Integer displayOrder) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        String fileName = fileStorageService.storeFile(photo);
        ActivityPhoto activityPhoto = new ActivityPhoto();
        activityPhoto.setActivity(activity);
        activityPhoto.setPhotoUrl(fileName);
        activityPhoto.setDisplayOrder(displayOrder != null ? displayOrder : 0);
        
        ActivityPhoto savedPhoto = activityPhotoRepository.save(activityPhoto);
        return convertPhotoToDTO(savedPhoto, null); // Pas de voterIp lors de l'ajout par l'admin
    }
    
    @Transactional
    public void deletePhoto(Long photoId) {
        activityPhotoRepository.deleteById(photoId);
    }
    
    @Transactional(readOnly = true)
    public List<ActivityDTO> getAllActivities(String voterIp) {
        // Retourner uniquement les activités publiées (confirmées) pour les utilisateurs
        return activityRepository.findAllPublishedAndActiveOrderByCreatedAtDesc().stream()
                .map(activity -> convertToDTO(activity, voterIp))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ActivityDTO> getProposedActivities(String voterIp) {
        // Retourner les activités proposées (en attente de vote)
        return activityRepository.findAllProposedAndActiveOrderByCreatedAtDesc().stream()
                .map(activity -> convertToDTO(activity, voterIp))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ActivityDTO> getPublishedActivities(String voterIp) {
        // Retourner les activités publiées (confirmées)
        return activityRepository.findAllPublishedAndActiveOrderByCreatedAtDesc().stream()
                .map(activity -> convertToDTO(activity, voterIp))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ActivityDTO> getAllActivitiesForAdmin(String voterIp) {
        return activityRepository.findAllOrderByCreatedAtDesc().stream()
                .map(activity -> convertToDTO(activity, voterIp))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public ActivityDTO getActivityById(Long id, String voterIp) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        return convertToDTO(activity, voterIp);
    }
    
    @Transactional
    public ActivityDTO toggleLike(Long activityId, String voterIp) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        boolean hasLiked = activityLikeRepository.existsByActivityAndVoterIp(activity, voterIp);
        
        if (hasLiked) {
            ActivityLike like = activityLikeRepository.findByActivityAndVoterIp(activity, voterIp)
                    .orElseThrow(() -> new RuntimeException("Like not found"));
            activityLikeRepository.delete(like);
        } else {
            ActivityLike like = new ActivityLike();
            like.setActivity(activity);
            like.setVoterIp(voterIp);
            activityLikeRepository.save(like);
        }
        
        activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        return convertToDTO(activity, voterIp);
    }
    
    @Transactional
    public void deleteActivity(Long id) {
        activityRepository.deleteById(id);
    }
    
    @Transactional
    public void toggleActivityStatus(Long id) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        activity.setIsActive(!activity.getIsActive());
        activityRepository.save(activity);
    }
    
    @Transactional
    public void publishActivity(Long id) {
        // Publier une activité (passer de proposée à publiée)
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        activity.setIsPublished(true);
        activityRepository.save(activity);
    }
    
    @Transactional
    public void unpublishActivity(Long id) {
        // Dépublier une activité (passer de publiée à proposée)
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        activity.setIsPublished(false);
        activityRepository.save(activity);
    }
    
    @Transactional(readOnly = true)
    public List<ActivityDTO> getProposedActivitiesForAdmin(String voterIp) {
        return activityRepository.findAllProposedOrderByCreatedAtDesc().stream()
                .map(activity -> convertToDTO(activity, voterIp))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ActivityDTO> getPublishedActivitiesForAdmin(String voterIp) {
        return activityRepository.findAllPublishedOrderByCreatedAtDesc().stream()
                .map(activity -> convertToDTO(activity, voterIp))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ActivityDTO> getPastActivities(String voterIp) {
        // Retourner les activités passées (pour permettre l'ajout de photos) - pour l'admin
        // Utilise la même méthode que getInactiveActivitiesForStudents pour garantir la cohérence
        // L'admin doit voir toutes les activités passées (isActive = false) pour pouvoir ajouter des photos
        return getInactiveActivitiesForStudents(voterIp);
    }
    
    @Transactional(readOnly = true)
    public List<ActivityDTO> getInactiveActivitiesForStudents(String voterIp) {
        // Retourner les activités passées (isActive = false) pour les étudiants
        return activityRepository.findInactiveActivitiesOrderByCreatedAtDesc().stream()
                .map(activity -> convertToDTO(activity, voterIp))
                .collect(Collectors.toList());
    }
    
    private ActivityDTO convertToDTO(Activity activity, String voterIp) {
        Long likeCount = activityLikeRepository.countByActivityId(activity.getId());
        Long likeCountForUser = voterIp != null ? activityLikeRepository.countByActivityIdAndVoterIp(activity.getId(), voterIp) : 0L;
        boolean hasLiked = likeCountForUser != null && likeCountForUser > 0;
        
        // Compter les reviews pour cette activité
        int reviewCount = reviewRepository.findByActivityId(activity.getId()).size();
        
        // Compter les commentaires pour cette activité (tous les commentaires de toutes les reviews)
        Long commentCountLong = commentRepository.countByActivityId(activity.getId());
        int commentCount = commentCountLong != null ? commentCountLong.intValue() : 0;
        
                // Récupérer toutes les photos de l'activité
                List<ActivityPhotoDTO> photos = activityPhotoRepository.findByActivityIdOrderByDisplayOrder(activity.getId())
                        .stream()
                        .map(photo -> convertPhotoToDTO(photo, voterIp))
                        .collect(Collectors.toList());
        
        return new ActivityDTO(
            activity.getId(),
            activity.getTitle(),
            activity.getDescription(),
            activity.getProgramme() != null ? activity.getProgramme() : null,
            activity.getLieu() != null ? activity.getLieu() : null,
            activity.getDateActivite() != null ? activity.getDateActivite() : null,
            activity.getHeureActivite() != null ? activity.getHeureActivite() : null,
            activity.getIsFree() != null ? activity.getIsFree() : true,
            activity.getPrix() != null ? activity.getPrix() : null,
            activity.getReservationRequired() != null ? activity.getReservationRequired() : false,
            activity.getReservationUrl() != null ? activity.getReservationUrl() : null,
            activity.getImageUrl() != null ? activity.getImageUrl() : null,
            activity.getCreatedAt(),
            likeCount != null ? likeCount.intValue() : 0,
            hasLiked,
            activity.getIsActive() != null ? activity.getIsActive() : true,
            activity.getIsPublished() != null ? activity.getIsPublished() : false,
            photos,
            reviewCount,
            commentCount
        );
    }
    
    private ActivityPhotoDTO convertPhotoToDTO(ActivityPhoto photo, String voterIp) {
        Long likeCount = activityPhotoLikeRepository.countByActivityPhotoId(photo.getId());
        boolean hasLiked = voterIp != null && activityPhotoLikeRepository.existsByActivityPhotoAndVoterIp(photo, voterIp);
        Long commentCount = (long) activityPhotoCommentRepository.findByActivityPhotoIdOrderByCreatedAtDesc(photo.getId()).size();
        
        return new ActivityPhotoDTO(
            photo.getId(),
            photo.getPhotoUrl(),
            photo.getDisplayOrder(),
            photo.getCreatedAt(),
            likeCount != null ? likeCount.intValue() : 0,
            hasLiked,
            commentCount != null ? commentCount.intValue() : 0
        );
    }
}

