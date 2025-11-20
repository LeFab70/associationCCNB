package com.ccnb.association.controller;

import com.ccnb.association.dto.ActivityDTO;
import com.ccnb.association.dto.ActivityPhotoDTO;
import com.ccnb.association.service.ActivityService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ActivityController {
    
    private final ActivityService activityService;
    
    @GetMapping
    public ResponseEntity<List<ActivityDTO>> getAllActivities(HttpServletRequest request) {
        // Retourne uniquement les activités publiées (confirmées)
        String voterIp = getClientIpAddress(request);
        List<ActivityDTO> activities = activityService.getAllActivities(voterIp);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/proposed")
    public ResponseEntity<List<ActivityDTO>> getProposedActivities(HttpServletRequest request) {
        // Retourne les activités proposées (en attente de vote)
        String voterIp = getClientIpAddress(request);
        List<ActivityDTO> activities = activityService.getProposedActivities(voterIp);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/published")
    public ResponseEntity<List<ActivityDTO>> getPublishedActivities(HttpServletRequest request) {
        // Retourne les activités publiées (confirmées)
        String voterIp = getClientIpAddress(request);
        List<ActivityDTO> activities = activityService.getPublishedActivities(voterIp);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ActivityDTO> getActivityById(@PathVariable Long id, HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        ActivityDTO activity = activityService.getActivityById(id, voterIp);
        return ResponseEntity.ok(activity);
    }
    
    @GetMapping("/admin")
    public ResponseEntity<List<ActivityDTO>> getAllActivitiesForAdmin(HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        List<ActivityDTO> activities = activityService.getAllActivitiesForAdmin(voterIp);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/admin/proposed")
    public ResponseEntity<List<ActivityDTO>> getProposedActivitiesForAdmin(HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        List<ActivityDTO> activities = activityService.getProposedActivitiesForAdmin(voterIp);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/admin/published")
    public ResponseEntity<List<ActivityDTO>> getPublishedActivitiesForAdmin(HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        List<ActivityDTO> activities = activityService.getPublishedActivitiesForAdmin(voterIp);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/admin/past")
    public ResponseEntity<List<ActivityDTO>> getPastActivities(HttpServletRequest request) {
        try {
            String voterIp = getClientIpAddress(request);
            List<ActivityDTO> activities = activityService.getPastActivities(voterIp);
            System.out.println("DEBUG Controller: Returning " + activities.size() + " past activities");
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            System.err.println("ERROR in getPastActivities: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(List.of());
        }
    }
    
    @GetMapping("/past")
    public ResponseEntity<List<ActivityDTO>> getInactiveActivitiesForStudents(HttpServletRequest request) {
        // Endpoint pour les étudiants - récupère les activités passées (isActive = false)
        String voterIp = getClientIpAddress(request);
        List<ActivityDTO> activities = activityService.getInactiveActivitiesForStudents(voterIp);
        return ResponseEntity.ok(activities);
    }
    
    @PostMapping
    public ResponseEntity<ActivityDTO> createActivity(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "programme", required = false) String programme,
            @RequestParam(value = "lieu", required = false) String lieu,
            @RequestParam(value = "dateActivite", required = false) String dateActivite,
            @RequestParam(value = "heureActivite", required = false) String heureActivite,
            @RequestParam(value = "isFree", required = false) Boolean isFree,
            @RequestParam(value = "prix", required = false) Double prix,
            @RequestParam(value = "reservationRequired", required = false) Boolean reservationRequired,
            @RequestParam(value = "reservationUrl", required = false) String reservationUrl,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "photos", required = false) List<MultipartFile> photos) {
        
        java.time.LocalDate date = null;
        if (dateActivite != null && !dateActivite.isEmpty()) {
            try {
                date = java.time.LocalDate.parse(dateActivite);
            } catch (Exception e) {
                // Ignore parsing errors
            }
        }
        
        ActivityDTO activity = activityService.createActivity(title, description, programme, lieu, 
                date, heureActivite, isFree, prix, reservationRequired, reservationUrl, 
                image, imageUrl, photos);
        return ResponseEntity.status(HttpStatus.CREATED).body(activity);
    }
    
    @PostMapping("/{id}/photos")
    public ResponseEntity<ActivityPhotoDTO> addPhoto(
            @PathVariable Long id,
            @RequestParam("photo") MultipartFile photo,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder) {
        
        ActivityPhotoDTO photoDTO = activityService.addPhotoToActivity(id, photo, displayOrder);
        return ResponseEntity.status(HttpStatus.CREATED).body(photoDTO);
    }
    
    @DeleteMapping("/photos/{photoId}")
    public ResponseEntity<Void> deletePhoto(@PathVariable Long photoId) {
        activityService.deletePhoto(photoId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/like")
    public ResponseEntity<ActivityDTO> toggleLike(@PathVariable Long id, HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        ActivityDTO activity = activityService.toggleLike(id, voterIp);
        return ResponseEntity.ok(activity);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> toggleActivityStatus(@PathVariable Long id) {
        activityService.toggleActivityStatus(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/publish")
    public ResponseEntity<Void> publishActivity(@PathVariable Long id) {
        activityService.publishActivity(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/unpublish")
    public ResponseEntity<Void> unpublishActivity(@PathVariable Long id) {
        activityService.unpublishActivity(id);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        activityService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

