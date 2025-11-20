package com.ccnb.association.controller;

import com.ccnb.association.dto.AdminDTO;
import com.ccnb.association.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {
    
    private final AdminService adminService;
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        boolean authenticated = adminService.authenticate(username, password);
        
        if (authenticated) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Login successful"));
        } else {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid credentials"));
        }
    }
    
    @GetMapping("/accounts")
    public ResponseEntity<List<AdminDTO>> getAllAdmins() {
        List<AdminDTO> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(admins);
    }
    
    @PostMapping("/accounts")
    public ResponseEntity<AdminDTO> createAdmin(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        
        AdminDTO admin = adminService.createAdmin(username, password);
        return ResponseEntity.ok(admin);
    }
    
    @PutMapping("/accounts/{id}/status")
    public ResponseEntity<Void> toggleAdminStatus(@PathVariable Long id) {
        adminService.toggleAdminStatus(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/accounts/{id}/password")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String newPassword = request.get("password");
        adminService.changePassword(id, newPassword);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/accounts/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/notifications")
    public ResponseEntity<List<String>> getNotifications() {
        // Pour l'instant, retourner une liste vide
        // En production, vous pourriez utiliser WebSocket ou Server-Sent Events
        return ResponseEntity.ok(List.of());
    }
}

