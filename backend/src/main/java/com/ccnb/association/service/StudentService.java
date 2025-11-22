package com.ccnb.association.service;

import com.ccnb.association.dto.StudentDTO;
import com.ccnb.association.entity.Student;
import com.ccnb.association.exceptions.BadRequestException;
import com.ccnb.association.exceptions.ResourceAlreadyExist;
import com.ccnb.association.exceptions.ResourceNotFoundException;
import com.ccnb.association.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {
    
    private final StudentRepository studentRepository;
    private final EmailService emailService;
    
    private static final String EMAIL_DOMAIN = "@monccnb.ca";
    private static final int CODE_EXPIRATION_MINUTES = 15;
    private static final int PASSWORD_RESET_CODE_EXPIRATION_MINUTES = 30;
    
    /**
     * Étape 1 : Vérifier l'email et créer le profil initial
     */
    @Transactional
    public StudentDTO startProfileCreation(String email) {
        // Vérifier que l'email contient @monccnb.ca
        if (!email.toLowerCase().endsWith(EMAIL_DOMAIN)) {
            throw new BadRequestException("L'email doit être un email CCNB (@monccnb.ca)");
        }
        
        // Vérifier si l'email existe déjà
        if (studentRepository.existsByEmail(email)) {
            throw new ResourceAlreadyExist("Un profil existe déjà avec cet email");
        }
        
        // Créer le profil initial (sans mot de passe, email non vérifié)
        Student student = Student.builder()
                .email(email.toLowerCase())
                .emailVerified(false)
                .isActive(true)
                .build();
        
        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }
    
    /**
     * Étape 2 : Compléter les informations du profil
     */
    @Transactional
    public StudentDTO completeProfileInfo(String email, String nom, String prenom, String filiere, String campus) {
        Student student = studentRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Profil non trouvé"));
        
        if (student.getEmailVerified()) {
            throw new BadRequestException("Le profil est déjà vérifié");
        }
        
        student.setNom(nom);
        student.setPrenom(prenom);
        student.setFiliere(filiere);
        student.setCampus(campus);
        
        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }
    
    /**
     * Étape 3 : Générer et envoyer le code de validation
     * @return le code de validation (retourné si l'email n'a pas pu être envoyé)
     */
    @Transactional
    public String sendValidationCode(String email) {
        Student student = studentRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Profil non trouvé"));
        
        if (student.getEmailVerified()) {
            throw new BadRequestException("L'email est déjà vérifié");
        }
        
        // Générer un code à 6 chiffres
        String code = generateValidationCode();
        student.setValidationCode(code);
        student.setCodeExpiresAt(LocalDateTime.now().plusMinutes(CODE_EXPIRATION_MINUTES));
        
        studentRepository.save(student);
        
        // Envoyer le code par email
        boolean emailSent = emailService.sendValidationCode(student.getEmail(), code);
        
        // Si l'email n'a pas pu être envoyé, retourner le code pour le développement
        if (!emailSent) {
            log.warn("⚠️ Email non envoyé pour {}. Code de validation: {}", email, code);
            return code; // Retourner le code pour le développement
        }
        
        return null; // Email envoyé avec succès
    }
    
    /**
     * Étape 4 : Vérifier le code de validation
     */
    @Transactional
    public StudentDTO verifyValidationCode(String email, String code) {
        Student student = studentRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Profil non trouvé"));
        
        if (student.getEmailVerified()) {
            throw new BadRequestException("L'email est déjà vérifié");
        }
        
        if (student.getValidationCode() == null || student.getCodeExpiresAt() == null) {
            throw new BadRequestException("Aucun code de validation n'a été envoyé");
        }
        
        if (LocalDateTime.now().isAfter(student.getCodeExpiresAt())) {
            throw new BadRequestException("Le code de validation a expiré. Veuillez demander un nouveau code.");
        }
        
        if (!student.getValidationCode().equals(code)) {
            throw new BadRequestException("Code de validation incorrect");
        }
        
        // Marquer l'email comme vérifié et supprimer le code
        student.setEmailVerified(true);
        student.setValidationCode(null);
        student.setCodeExpiresAt(null);
        
        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }
    
    /**
     * Étape 5 : Définir le mot de passe
     */
    @Transactional
    public StudentDTO setPassword(String email, String password, String confirmPassword) {
        if (!password.equals(confirmPassword)) {
            throw new BadRequestException("Les mots de passe ne correspondent pas");
        }
        
        if (password.length() < 6) {
            throw new BadRequestException("Le mot de passe doit contenir au moins 6 caractères");
        }
        
        Student student = studentRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Profil non trouvé"));
        
        if (!student.getEmailVerified()) {
            throw new BadRequestException("L'email doit être vérifié avant de définir le mot de passe");
        }
        
        if (student.getNom() == null || student.getNom().isEmpty()) {
            throw new BadRequestException("Veuillez compléter les informations de votre profil avant de définir le mot de passe");
        }
        
        // Hasher le mot de passe avec SHA-256
        String hashedPassword = hashPassword(password);
        student.setPassword(hashedPassword);
        
        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }
    
    /**
     * Connexion étudiant
     */
    @Transactional(readOnly = true)
    public StudentDTO login(String email, String password) {
        Student student = studentRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Email ou mot de passe incorrect"));
        
        if (!student.getEmailVerified()) {
            throw new BadRequestException("Votre email n'est pas encore vérifié. Veuillez vérifier votre email.");
        }
        
        if (student.getPassword() == null || student.getPassword().isEmpty()) {
            throw new BadRequestException("Aucun mot de passe défini. Veuillez compléter la création de votre profil.");
        }
        
        if (!student.getIsActive()) {
            throw new BadRequestException("Votre compte est désactivé");
        }
        
        String hashedPassword = hashPassword(password);
        if (!student.getPassword().equals(hashedPassword)) {
            throw new BadRequestException("Email ou mot de passe incorrect");
        }
        
        return convertToDTO(student);
    }
    
    /**
     * Mettre à jour le profil
     */
    @Transactional
    public StudentDTO updateProfile(String email, String nom, String prenom, String filiere, String campus) {
        Student student = studentRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Profil non trouvé"));
        
        student.setNom(nom);
        student.setPrenom(prenom);
        student.setFiliere(filiere);
        student.setCampus(campus);
        
        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }
    
    /**
     * Récupérer le profil par email
     */
    @Transactional(readOnly = true)
    public StudentDTO getProfileByEmail(String email) {
        Student student = studentRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Profil non trouvé"));
        return convertToDTO(student);
    }
    
    /**
     * Demander la réinitialisation du mot de passe
     * @return le code de réinitialisation (retourné si l'email n'a pas pu être envoyé)
     */
    @Transactional
    public String requestPasswordReset(String email) {
        Student student = studentRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Aucun compte trouvé avec cet email"));
        
        if (!student.getEmailVerified()) {
            throw new BadRequestException("Votre email n'est pas encore vérifié. Veuillez d'abord vérifier votre email.");
        }
        
        if (!student.getIsActive()) {
            throw new BadRequestException("Votre compte est désactivé");
        }
        
        // Générer un code de réinitialisation à 6 chiffres
        String resetCode = generateValidationCode();
        student.setPasswordResetCode(resetCode);
        student.setPasswordResetExpiresAt(LocalDateTime.now().plusMinutes(PASSWORD_RESET_CODE_EXPIRATION_MINUTES));
        
        studentRepository.save(student);
        
        // Envoyer le code par email
        boolean emailSent = emailService.sendPasswordResetCode(student.getEmail(), resetCode);
        
        // Si l'email n'a pas pu être envoyé, retourner le code pour le développement
        if (!emailSent) {
            log.warn("⚠️ Email de réinitialisation non envoyé pour {}. Code: {}", email, resetCode);
            return resetCode;
        }
        
        return null; // Email envoyé avec succès
    }
    
    /**
     * Réinitialiser le mot de passe avec le code
     */
    @Transactional
    public StudentDTO resetPassword(String email, String resetCode, String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) {
            throw new BadRequestException("Les mots de passe ne correspondent pas");
        }
        
        if (newPassword.length() < 6) {
            throw new BadRequestException("Le mot de passe doit contenir au moins 6 caractères");
        }
        
        Student student = studentRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Aucun compte trouvé avec cet email"));
        
        if (student.getPasswordResetCode() == null || student.getPasswordResetExpiresAt() == null) {
            throw new BadRequestException("Aucun code de réinitialisation n'a été demandé");
        }
        
        if (LocalDateTime.now().isAfter(student.getPasswordResetExpiresAt())) {
            throw new BadRequestException("Le code de réinitialisation a expiré. Veuillez demander un nouveau code.");
        }
        
        if (!student.getPasswordResetCode().equals(resetCode)) {
            throw new BadRequestException("Code de réinitialisation incorrect");
        }
        
        // Hasher le nouveau mot de passe
        String hashedPassword = hashPassword(newPassword);
        student.setPassword(hashedPassword);
        
        // Supprimer le code de réinitialisation
        student.setPasswordResetCode(null);
        student.setPasswordResetExpiresAt(null);
        
        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }
    
    /**
     * Génère un code de validation à 6 chiffres
     */
    private String generateValidationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Code entre 100000 et 999999
        return String.valueOf(code);
    }
    
    /**
     * Hash un mot de passe avec SHA-256
     */
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erreur lors du hachage du mot de passe", e);
        }
    }
    
    private StudentDTO convertToDTO(Student student) {
        return new StudentDTO(
            student.getId(),
            student.getEmail(),
            student.getNom(),
            student.getPrenom(),
            student.getFiliere(),
            student.getCampus(),
            student.getEmailVerified(),
            student.getIsActive(),
            student.getCreatedAt()
        );
    }
}

