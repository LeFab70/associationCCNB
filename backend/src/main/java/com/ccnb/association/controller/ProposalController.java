package com.ccnb.association.controller;

import com.ccnb.association.dto.ProposalDTO;
import com.ccnb.association.service.ProposalService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proposals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProposalController {
    
    private final ProposalService proposalService;
    
    // Routes spécifiques AVANT les routes avec path variables et les routes génériques
    @GetMapping("/admin")
    public ResponseEntity<List<ProposalDTO>> getAllProposalsForAdmin(HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        List<ProposalDTO> proposals = proposalService.getAllProposalsForAdmin(voterIp);
        return ResponseEntity.ok(proposals);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ProposalDTO>> searchProposals(
            @RequestParam("q") String searchTerm,
            HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        List<ProposalDTO> proposals = proposalService.searchProposals(searchTerm, voterIp);
        return ResponseEntity.ok(proposals);
    }
    
    @GetMapping
    public ResponseEntity<List<ProposalDTO>> getAllProposals(HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        List<ProposalDTO> proposals = proposalService.getAllProposals(voterIp);
        return ResponseEntity.ok(proposals);
    }
    
    @PostMapping
    public ResponseEntity<ProposalDTO> createProposal(
            @RequestParam("name") String name,
            @RequestParam("proposalText") String proposalText,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "photoUrl", required = false) String photoUrl,
            HttpServletRequest request) {
        
        String voterIp = getClientIpAddress(request);
        ProposalDTO proposal = proposalService.createProposal(name, proposalText, photo, photoUrl, voterIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(proposal);
    }
    
    @PostMapping("/{id}/vote")
    public ResponseEntity<ProposalDTO> toggleVote(@PathVariable Long id, HttpServletRequest request) {
        String voterIp = getClientIpAddress(request);
        ProposalDTO proposal = proposalService.toggleVote(id, voterIp);
        return ResponseEntity.ok(proposal);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> toggleProposalStatus(@PathVariable Long id) {
        try {
            proposalService.toggleProposalStatus(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Proposal not found", "message", e.getMessage()));
            }
            throw e;
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProposal(@PathVariable Long id) {
        proposalService.deleteProposal(id);
        return ResponseEntity.noContent().build();
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

