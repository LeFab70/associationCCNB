package com.ccnb.association.dto;

import java.time.LocalDateTime;

public record ActivityPhotoDTO(
    Long id,
    String photoUrl,
    Integer displayOrder,
    LocalDateTime createdAt,
    int likeCount,
    boolean hasLiked,
    int commentCount
) {}

