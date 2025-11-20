package com.ccnb.association.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ActivityDTO(
    Long id,
    String title,
    String description,
    String programme,
    String lieu,
    LocalDate dateActivite,
    String heureActivite,
    Boolean isFree,
    Double prix,
    Boolean reservationRequired,
    String reservationUrl,
    String imageUrl,
    LocalDateTime createdAt,
    int likeCount,
    boolean hasLiked,
    Boolean isActive,
    Boolean isPublished,
    List<ActivityPhotoDTO> photos,
    int reviewCount,
    int commentCount
) {}

