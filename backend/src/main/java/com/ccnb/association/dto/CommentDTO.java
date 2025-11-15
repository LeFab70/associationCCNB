package com.ccnb.association.dto;

import java.time.LocalDateTime;

public record CommentDTO(
    Long id,
    String name,
    String commentText,
    LocalDateTime createdAt
) {}

