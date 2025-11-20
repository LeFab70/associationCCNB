package com.ccnb.association.dto;

import java.time.LocalDateTime;

public record ReviewDTO(
    Long id,
    String name,
    String reviewText,
    String photoUrl,
    LocalDateTime createdAt,
    Boolean isApproved,
    int likeCount,
    boolean hasLiked,
    Long activityId,
    String activityTitle
) {}
