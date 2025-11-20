package com.ccnb.association.repository;

import com.ccnb.association.entity.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Long> {
    
    @Query("SELECT p FROM Proposal p ORDER BY p.createdAt DESC")
    List<Proposal> findAllOrderByCreatedAtDesc();
    
    @Query("SELECT p FROM Proposal p WHERE p.isActive = true ORDER BY p.createdAt DESC")
    List<Proposal> findAllActiveOrderByCreatedAtDesc();
    
    @Query("SELECT p FROM Proposal p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.proposalText) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Proposal> findByNameContainingIgnoreCaseOrProposalTextContainingIgnoreCase(@Param("searchTerm") String searchTerm);
}

