package com.ccnb.association.dto;

import java.time.LocalDateTime;

public record AdminDTO(
    Long id,
    String username,
    Boolean isActive,
    LocalDateTime createdAt
) {}

