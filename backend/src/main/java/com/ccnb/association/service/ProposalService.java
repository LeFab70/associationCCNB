package com.ccnb.association.service;

import com.ccnb.association.dto.ProposalDTO;
import com.ccnb.association.entity.Proposal;
import com.ccnb.association.entity.Vote;
import com.ccnb.association.repository.ProposalRepository;
import com.ccnb.association.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProposalService {
    
    private final ProposalRepository proposalRepository;
    private final VoteRepository voteRepository;
    private final FileStorageService fileStorageService;
    
    @Transactional
    public ProposalDTO createProposal(String name, String proposalText, MultipartFile photo, String photoUrl, String voterIp) {
        Proposal proposal = new Proposal();
        proposal.setName(name);
        proposal.setProposalText(proposalText);
        
        // Priorité à photoUrl si fourni (fichier déjà uploadé via FTP)
        if (photoUrl != null && !photoUrl.isEmpty()) {
            proposal.setPhotoUrl(photoUrl);
        } else if (photo != null && !photo.isEmpty()) {
            // Sinon, uploader le fichier
            String fileName = fileStorageService.storeFile(photo);
            proposal.setPhotoUrl(fileName);
        }
        
        Proposal savedProposal = proposalRepository.save(proposal);
        return convertToDTO(savedProposal, voterIp);
    }
    
    @Transactional(readOnly = true)
    public List<ProposalDTO> getAllProposals(String voterIp) {
        return proposalRepository.findAllActiveOrderByCreatedAtDesc().stream()
                .map(proposal -> convertToDTO(proposal, voterIp))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ProposalDTO> getAllProposalsForAdmin(String voterIp) {
        return proposalRepository.findAllOrderByCreatedAtDesc().stream()
                .map(proposal -> convertToDTO(proposal, voterIp))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ProposalDTO> searchProposals(String searchTerm, String voterIp) {
        return proposalRepository.findByNameContainingIgnoreCaseOrProposalTextContainingIgnoreCase(searchTerm).stream()
                .map(proposal -> convertToDTO(proposal, voterIp))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ProposalDTO toggleVote(Long proposalId, String voterIp) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));
        
        boolean hasVoted = voteRepository.existsByProposalAndVoterIp(proposal, voterIp);
        
        if (hasVoted) {
            Vote vote = voteRepository.findByProposalAndVoterIp(proposal, voterIp)
                    .orElseThrow(() -> new RuntimeException("Vote not found"));
            voteRepository.delete(vote);
        } else {
            Vote vote = new Vote();
            vote.setProposal(proposal);
            vote.setVoterIp(voterIp);
            voteRepository.save(vote);
        }
        
        proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));
        
        return convertToDTO(proposal, voterIp);
    }
    
    @Transactional
    public void deleteProposal(Long id) {
        proposalRepository.deleteById(id);
    }
    
    @Transactional
    public void toggleProposalStatus(Long id) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proposal not found with id: " + id));
        
        // S'assurer que isActive n'est pas null avant de le modifier
        Boolean currentStatus = proposal.getIsActive();
        if (currentStatus == null) {
            currentStatus = true; // Valeur par défaut
        }
        proposal.setIsActive(!currentStatus);
        proposalRepository.save(proposal);
    }
    
    private ProposalDTO convertToDTO(Proposal proposal, String voterIp) {
        // Utiliser des requêtes directes pour éviter les problèmes de lazy loading
        Long voteCount = voteRepository.countByProposalId(proposal.getId());
        Long voteCountForUser = voterIp != null ? voteRepository.countByProposalIdAndVoterIp(proposal.getId(), voterIp) : 0L;
        boolean hasVoted = voteCountForUser != null && voteCountForUser > 0;
        
        return new ProposalDTO(
            proposal.getId(),
            proposal.getName(),
            proposal.getProposalText(),
            proposal.getPhotoUrl(),
            proposal.getCreatedAt(),
            voteCount != null ? voteCount.intValue() : 0,
            hasVoted,
            proposal.getIsActive()
        );
    }
}

