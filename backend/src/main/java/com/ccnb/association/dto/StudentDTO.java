package com.ccnb.association.dto;

import java.time.LocalDateTime;

public record StudentDTO(
    Long id,
    String email,
    String nom,
    String prenom,
    String filiere,
    String campus,
    Boolean emailVerified,
    Boolean isActive,
    LocalDateTime createdAt
) {}

