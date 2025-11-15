package com.ccnb.association.repository;

import com.ccnb.association.entity.Proposal;
import com.ccnb.association.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    
    Optional<Vote> findByProposalAndVoterIp(Proposal proposal, String voterIp);
    
    boolean existsByProposalAndVoterIp(Proposal proposal, String voterIp);
}

