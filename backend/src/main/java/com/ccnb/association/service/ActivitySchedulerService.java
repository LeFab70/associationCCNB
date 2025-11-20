package com.ccnb.association.service;

import com.ccnb.association.entity.Activity;
import com.ccnb.association.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivitySchedulerService {
    
    private final ActivityRepository activityRepository;
    private final NotificationService notificationService;
    
    /**
     * Désactive automatiquement les activités passées depuis plus de 2 semaines
     * Exécuté tous les jours à minuit
     */
    @Scheduled(cron = "0 0 0 * * ?") // Tous les jours à minuit
    @Transactional
    public void deactivatePastActivities() {
        LocalDate twoWeeksAgo = LocalDate.now().minusWeeks(2);
        
        // Trouver toutes les activités actives dont la date est passée depuis plus de 2 semaines
        List<Activity> pastActivities = activityRepository.findAll().stream()
                .filter(activity -> {
                    if (activity.getDateActivite() == null) {
                        return false;
                    }
                    return activity.getDateActivite().isBefore(twoWeeksAgo) 
                           && (activity.getIsActive() == null || activity.getIsActive());
                })
                .toList();
        
        if (!pastActivities.isEmpty()) {
            int count = 0;
            for (Activity activity : pastActivities) {
                activity.setIsActive(false);
                activityRepository.save(activity);
                count++;
            }
            
            log.info("Désactivé {} activités passées", count);
            
            // Notifier l'admin
            notificationService.notifyAdminsOfDeactivatedActivities(count);
        }
    }
}

