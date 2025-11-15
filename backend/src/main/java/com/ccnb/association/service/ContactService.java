package com.ccnb.association.service;

import com.ccnb.association.dto.ContactDTO;
import com.ccnb.association.entity.Contact;
import com.ccnb.association.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactService {
    
    private final ContactRepository contactRepository;
    private final JavaMailSender mailSender;
    
    @Transactional
    public ContactDTO createContact(String name, String email, String message) {
        Contact contact = new Contact();
        contact.setName(name);
        contact.setEmail(email);
        contact.setMessage(message);
        
        Contact savedContact = contactRepository.save(contact);
        
        // Envoyer un email à l'association
        sendEmailNotification(savedContact);
        
        return convertToDTO(savedContact);
    }
    
    @Transactional(readOnly = true)
    public List<ContactDTO> getAllContacts() {
        return contactRepository.findAllOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void markAsRead(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        contact.setIsRead(true);
        contactRepository.save(contact);
    }
    
    @Transactional
    public void deleteContact(Long id) {
        contactRepository.deleteById(id);
    }
    
    private void sendEmailNotification(Contact contact) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("association@ccnb.ca"); // À configurer dans application.properties
            message.setSubject("Nouveau message de contact - " + contact.getName());
            message.setText("Nom: " + contact.getName() + "\n" +
                          "Email: " + contact.getEmail() + "\n\n" +
                          "Message:\n" + contact.getMessage());
            mailSender.send(message);
        } catch (Exception e) {
            // Log l'erreur mais ne pas faire échouer la création du contact
            System.err.println("Erreur lors de l'envoi de l'email: " + e.getMessage());
        }
    }
    
    private ContactDTO convertToDTO(Contact contact) {
        return new ContactDTO(
            contact.getId(),
            contact.getName(),
            contact.getEmail(),
            contact.getMessage(),
            contact.getIsRead(),
            contact.getCreatedAt()
        );
    }
}

