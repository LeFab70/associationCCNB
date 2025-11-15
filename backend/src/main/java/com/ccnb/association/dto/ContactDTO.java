package com.ccnb.association.dto;

import java.time.LocalDateTime;

public record ContactDTO(
    Long id,
    String name,
    String email,
    String message,
    Boolean isRead,
    LocalDateTime createdAt
) {}
