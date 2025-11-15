package com.ccnb.association.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Association des Étudiants CCNB")
                        .version("1.0.0")
                        .description("API REST pour la gestion des propositions, avis et contacts de l'Association des Étudiants du Collège communautaire du Nouveau-Brunswick")
                        .contact(new Contact()
                                .name("Association des Étudiants CCNB")
                                .email("association@ccnb.ca"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}

