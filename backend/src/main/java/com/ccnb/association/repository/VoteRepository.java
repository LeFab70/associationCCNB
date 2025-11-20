package com.ccnb.association.repository;

import com.ccnb.association.entity.Proposal;
import com.ccnb.association.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    
    Optional<Vote> findByProposalAndVoterIp(Proposal proposal, String voterIp);
    
    boolean existsByProposalAndVoterIp(Proposal proposal, String voterIp);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.proposal.id = :proposalId")
    Long countByProposalId(@Param("proposalId") Long proposalId);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.proposal.id = :proposalId AND v.voterIp = :voterIp")
    Long countByProposalIdAndVoterIp(@Param("proposalId") Long proposalId, @Param("voterIp") String voterIp);
}

