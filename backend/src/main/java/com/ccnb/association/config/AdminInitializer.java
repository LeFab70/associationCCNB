package com.ccnb.association.config;

import com.ccnb.association.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {
    
    private final AdminService adminService;
    
    @Override
    public void run(String... args) {
        adminService.createDefaultAdmin();
    }
}

