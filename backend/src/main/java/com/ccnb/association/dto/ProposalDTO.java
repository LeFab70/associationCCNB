package com.ccnb.association.dto;

import java.time.LocalDateTime;

public record ProposalDTO(
    Long id,
    String name,
    String proposalText,
    String photoUrl,
    LocalDateTime createdAt,
    int voteCount,
    boolean hasVoted,
    Boolean isActive
) {}
