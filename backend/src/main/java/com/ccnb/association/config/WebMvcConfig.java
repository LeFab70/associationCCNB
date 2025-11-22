package com.ccnb.association.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {
    
    private final SessionInterceptor sessionInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sessionInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/students/start-creation",
                                     "/api/students/complete-info",
                                     "/api/students/send-validation-code",
                                     "/api/students/verify-code",
                                     "/api/students/set-password",
                                     "/api/students/login",
                                     "/api/students/check-auth",
                                     "/api/admins/login",
                                     "/api/admin/check-auth",
                                     "/api-docs/**",
                                     "/swagger-ui/**");
    }
}

