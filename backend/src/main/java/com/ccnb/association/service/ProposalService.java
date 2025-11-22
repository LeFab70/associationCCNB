package com.ccnb.association.service;

import com.ccnb.association.dto.ActivityDTO;
import com.ccnb.association.dto.ProposalDTO;
import com.ccnb.association.entity.Activity;
import com.ccnb.association.entity.Proposal;
import com.ccnb.association.entity.Vote;
import com.ccnb.association.exceptions.ResourceNotFoundException;
import com.ccnb.association.repository.ActivityRepository;
import com.ccnb.association.repository.ProposalRepository;
import com.ccnb.association.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProposalService {
    
    private final ProposalRepository proposalRepository;
    private final VoteRepository voteRepository;
    private final FileStorageService fileStorageService;
    private final ActivityRepository activityRepository;
    
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
        // Retourner uniquement les propositions actives (non converties)
        return proposalRepository.findAllActiveOrderByCreatedAtDesc().stream()
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
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found"));
        
        boolean hasVoted = voteRepository.existsByProposalAndVoterIp(proposal, voterIp);
        
        if (hasVoted) {
            Vote vote = voteRepository.findByProposalAndVoterIp(proposal, voterIp)
                    .orElseThrow(() -> new ResourceNotFoundException("Vote not found"));
            voteRepository.delete(vote);
        } else {
            Vote vote = new Vote();
            vote.setProposal(proposal);
            vote.setVoterIp(voterIp);
            voteRepository.save(vote);
        }
        
        proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found"));
        
        return convertToDTO(proposal, voterIp);
    }
    
    @Transactional
    public void deleteProposal(Long id) {
        proposalRepository.deleteById(id);
    }
    
    @Transactional
    public void toggleProposalStatus(Long id) {
        Proposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found with id: " + id));
        
        // S'assurer que isActive n'est pas null avant de le modifier
        Boolean currentStatus = proposal.getIsActive();
        if (currentStatus == null) {
            currentStatus = true; // Valeur par défaut
        }
        proposal.setIsActive(!currentStatus);
        proposalRepository.save(proposal);
    }
    
    @Transactional
    public ActivityDTO convertProposalToActivity(Long proposalId, LocalDateTime votingDeadline) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found"));
        
        // Créer une activité à partir de la proposition
        Activity activity = Activity.builder()
                .title(proposal.getName())
                .description(proposal.getProposalText())
                .imageUrl(proposal.getPhotoUrl())
                .isActive(true)
                .isPublished(false) // Activité proposée (à voter)
                .votingDeadline(votingDeadline)
                .build();
        
        Activity savedActivity = activityRepository.save(activity);
        
        // Désactiver la proposition pour qu'elle ne soit plus visible
        proposal.setIsActive(false);
        proposalRepository.save(proposal);
        
        // Convertir en DTO (simplifié, sans voterIp car c'est pour l'admin)
        return new ActivityDTO(
            savedActivity.getId(),
            savedActivity.getTitle(),
            savedActivity.getDescription(),
            null, // programme
            null, // lieu
            null, // dateActivite
            null, // heureActivite
            true, // isFree
            null, // prix
            false, // reservationRequired
            null, // reservationUrl
            savedActivity.getImageUrl(),
            savedActivity.getCreatedAt(),
            0, // likeCount
            false, // hasLiked
            savedActivity.getIsActive(),
            savedActivity.getIsPublished(),
            List.of(), // photos
            0, // reviewCount
            0, // commentCount
            null, // markedAsPastAt
            null, // autoDeleteDelayDays
            savedActivity.getVotingDeadline()
        );
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

