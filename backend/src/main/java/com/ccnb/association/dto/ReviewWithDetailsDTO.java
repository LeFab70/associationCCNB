package com.ccnb.association.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ReviewWithDetailsDTO(
    Long id,
    String name,
    String reviewText,
    String photoUrl,
    LocalDateTime createdAt,
    Boolean isApproved,
    int likeCount,
    boolean hasLiked,
    List<CommentDTO> comments
) {}

