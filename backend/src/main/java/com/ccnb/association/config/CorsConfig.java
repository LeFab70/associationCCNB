package com.ccnb.association.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistration() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        
        // Utiliser allowedOriginPatterns pour permettre tous les ports localhost
        config.addAllowedOriginPattern("http://localhost:*");
        config.addAllowedOriginPattern("http://127.0.0.1:*");
        
        // Ajouter les origines spécifiques depuis la configuration
        if (allowedOrigins != null && !allowedOrigins.isEmpty() && !"*".equals(allowedOrigins)) {
            config.addAllowedOrigin(allowedOrigins);
        }
        
        // Ajouter les origines spécifiques
        config.addAllowedOrigin("http://localhost:4200");
        config.addAllowedOrigin("http://localhost:55082");
        config.addAllowedOrigin("http://localhost:57401");
        config.addAllowedOrigin("http://college-dev.com");
        config.addAllowedOrigin("https://college-dev.com");
        
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE); // Priorité la plus haute pour s'exécuter en premier
        return bean;
    }
}

