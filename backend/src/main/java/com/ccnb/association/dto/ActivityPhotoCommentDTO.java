package com.ccnb.association.dto;

import java.time.LocalDateTime;

public record ActivityPhotoCommentDTO(
    Long id,
    String name,
    String commentText,
    LocalDateTime createdAt,
    Boolean isApproved
) {}

