package com.ccnb.association.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    /**
     * Envoie un code de validation par email
     * @return true si l'email a été envoyé avec succès, false sinon
     */
    public boolean sendValidationCode(String toEmail, String validationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Code de validation - Association Étudiante CCNB");
            message.setText(
                "Bonjour,\n\n" +
                "Vous avez demandé à créer un profil sur le site de l'Association Étudiante du CCNB.\n\n" +
                "Votre code de validation est : " + validationCode + "\n\n" +
                "Ce code est valide pendant 15 minutes.\n\n" +
                "Si vous n'avez pas demandé à créer un profil, veuillez ignorer cet email.\n\n" +
                "Cordialement,\n" +
                "L'équipe de l'Association Étudiante CCNB"
            );
            mailSender.send(message);
            log.info("Code de validation envoyé à {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi du code de validation à {}: {}", toEmail, e.getMessage());
            log.warn("⚠️ L'email n'a pas pu être envoyé. En mode développement, utilisez le code affiché dans les logs: {}", validationCode);
            // Ne pas bloquer le processus, retourner false pour indiquer l'échec
            return false;
        }
    }
    
    /**
     * Envoie un code de réinitialisation de mot de passe par email
     * @return true si l'email a été envoyé avec succès, false sinon
     */
    public boolean sendPasswordResetCode(String toEmail, String resetCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Réinitialisation de mot de passe - Association Étudiante CCNB");
            message.setText(
                "Bonjour,\n\n" +
                "Vous avez demandé à réinitialiser votre mot de passe sur le site de l'Association Étudiante du CCNB.\n\n" +
                "Votre code de réinitialisation est : " + resetCode + "\n\n" +
                "Ce code est valide pendant 30 minutes.\n\n" +
                "Si vous n'avez pas demandé à réinitialiser votre mot de passe, veuillez ignorer cet email.\n\n" +
                "Pour votre sécurité, ne partagez jamais ce code avec personne.\n\n" +
                "Cordialement,\n" +
                "L'équipe de l'Association Étudiante CCNB"
            );
            mailSender.send(message);
            log.info("Code de réinitialisation envoyé à {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi du code de réinitialisation à {}: {}", toEmail, e.getMessage());
            log.warn("⚠️ L'email n'a pas pu être envoyé. En mode développement, utilisez le code affiché dans les logs: {}", resetCode);
            // Ne pas bloquer le processus, retourner false pour indiquer l'échec
            return false;
        }
    }
}

