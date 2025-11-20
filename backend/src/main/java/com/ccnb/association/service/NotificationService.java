package com.ccnb.association.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    // Stockage temporaire des notifications pour les admins connectés
    // En production, vous pourriez utiliser WebSocket ou Server-Sent Events
    private final ConcurrentHashMap<String, ConcurrentLinkedQueue<String>> adminNotifications = new ConcurrentHashMap<>();
    
    public void notifyAdminsOfDeactivatedActivities(int count) {
        String message = count + " activité(s) passée(s) ont été automatiquement désactivée(s) après 2 semaines.";
        log.info("Notification admin: {}", message);
        
        // Ajouter la notification pour tous les admins
        // En production, vous pourriez envoyer via WebSocket ou email
        adminNotifications.values().forEach(queue -> queue.offer(message));
    }
    
    public void addAdminSession(String sessionId) {
        adminNotifications.putIfAbsent(sessionId, new ConcurrentLinkedQueue<>());
    }
    
    public void removeAdminSession(String sessionId) {
        adminNotifications.remove(sessionId);
    }
    
    public ConcurrentLinkedQueue<String> getNotifications(String sessionId) {
        return adminNotifications.getOrDefault(sessionId, new ConcurrentLinkedQueue<>());
    }
    
    public void clearNotifications(String sessionId) {
        ConcurrentLinkedQueue<String> queue = adminNotifications.get(sessionId);
        if (queue != null) {
            queue.clear();
        }
    }
}

