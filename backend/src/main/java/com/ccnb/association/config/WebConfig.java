package com.ccnb.association.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // Configuration vide - les contrôleurs REST gèrent les routes /api/*
    // Cette classe existe pour s'assurer que Spring ne traite pas /api/* comme des ressources statiques
}

