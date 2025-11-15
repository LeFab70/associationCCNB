package com.ccnb.association.service;

import com.ccnb.association.entity.Admin;
import com.ccnb.association.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final AdminRepository adminRepository;
    
    @Transactional
    public boolean authenticate(String username, String password) {
        return adminRepository.findByUsername(username)
                .map(admin -> {
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
            adminRepository.save(admin);
        }
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

