package com.ccnb.association.service;

import com.ccnb.association.dto.AdminDTO;
import com.ccnb.association.entity.Admin;
import com.ccnb.association.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final AdminRepository adminRepository;
    
    @Transactional
    public boolean authenticate(String username, String password) {
        return adminRepository.findByUsername(username)
                .map(admin -> {
                    if (admin.getIsActive() == null || !admin.getIsActive()) {
                        return false; // Admin désactivé
                    }
                    String hashedPassword = hashPassword(password);
                    return admin.getPassword().equals(hashedPassword);
                })
                .orElse(false);
    }
    
    @Transactional
    public void createDefaultAdmin() {
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword(hashPassword("admin123"));
            admin.setIsActive(true);
            adminRepository.save(admin);
        }
    }
    
    @Transactional
    public AdminDTO createAdmin(String username, String password) {
        if (adminRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        Admin admin = new Admin();
        admin.setUsername(username);
        admin.setPassword(hashPassword(password));
        admin.setIsActive(true);
        
        Admin savedAdmin = adminRepository.save(admin);
        return convertToDTO(savedAdmin);
    }
    
    @Transactional(readOnly = true)
    public List<AdminDTO> getAllAdmins() {
        return adminRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void toggleAdminStatus(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        admin.setIsActive(!admin.getIsActive());
        adminRepository.save(admin);
    }
    
    @Transactional
    public void changePassword(Long id, String newPassword) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        admin.setPassword(hashPassword(newPassword));
        adminRepository.save(admin);
    }
    
    @Transactional
    public void deleteAdmin(Long id) {
        adminRepository.deleteById(id);
    }
    
    private AdminDTO convertToDTO(Admin admin) {
        return new AdminDTO(
            admin.getId(),
            admin.getUsername(),
            admin.getIsActive() != null ? admin.getIsActive() : true,
            admin.getCreatedAt() != null ? admin.getCreatedAt() : java.time.LocalDateTime.now()
        );
    }
    
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
}

