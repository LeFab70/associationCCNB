package com.ccnb.association.controller;

import com.ccnb.association.dto.StudentDTO;
import com.ccnb.association.service.StudentService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"}, allowCredentials = "true")
public class StudentController {
    
    private final StudentService studentService;
    
    /**
     * Étape 1 : Démarrer la création de profil (vérifier l'email)
     * POST /api/students/start-creation
     */
    @PostMapping("/start-creation")
    public ResponseEntity<StudentDTO> startProfileCreation(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        StudentDTO student = studentService.startProfileCreation(email);
        return ResponseEntity.status(HttpStatus.CREATED).body(student);
    }
    
    /**
     * Étape 2 : Compléter les informations du profil
     * PUT /api/students/complete-info
     */
    @PutMapping("/complete-info")
    public ResponseEntity<StudentDTO> completeProfileInfo(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String nom = request.get("nom");
        String prenom = request.get("prenom");
        String filiere = request.get("filiere");
        String campus = request.get("campus");
        
        if (email == null || nom == null || filiere == null || campus == null) {
            return ResponseEntity.badRequest().build();
        }
        
        StudentDTO student = studentService.completeProfileInfo(email, nom, prenom, filiere, campus);
        return ResponseEntity.ok(student);
    }
    
    /**
     * Étape 3 : Demander l'envoi du code de validation
     * POST /api/students/send-validation-code
     */
    @PostMapping("/send-validation-code")
    public ResponseEntity<Map<String, String>> sendValidationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        String code = studentService.sendValidationCode(email);
        
        if (code != null) {
            // L'email n'a pas pu être envoyé, retourner le code pour le développement
            return ResponseEntity.ok(Map.of(
                "message", "Code de validation généré (email non envoyé - vérifiez la configuration)",
                "code", code,
                "warning", "L'email n'a pas pu être envoyé. Utilisez ce code pour continuer."
            ));
        }
        
        return ResponseEntity.ok(Map.of("message", "Code de validation envoyé par email"));
    }
    
    /**
     * Étape 4 : Vérifier le code de validation
     * POST /api/students/verify-code
     */
    @PostMapping("/verify-code")
    public ResponseEntity<StudentDTO> verifyValidationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        
        if (email == null || code == null) {
            return ResponseEntity.badRequest().build();
        }
        
        StudentDTO student = studentService.verifyValidationCode(email, code);
        return ResponseEntity.ok(student);
    }
    
    /**
     * Étape 5 : Définir le mot de passe
     * POST /api/students/set-password
     */
    @PostMapping("/set-password")
    public ResponseEntity<StudentDTO> setPassword(@RequestBody Map<String, String> request, HttpSession session) {
        String email = request.get("email");
        String password = request.get("password");
        String confirmPassword = request.get("confirmPassword");
        
        if (email == null || password == null || confirmPassword == null) {
            return ResponseEntity.badRequest().build();
        }
        
        StudentDTO student = studentService.setPassword(email, password, confirmPassword);
        
        // Créer une session pour l'étudiant connecté
        session.setAttribute("studentEmail", student.email());
        session.setAttribute("studentId", student.id());
        
        return ResponseEntity.ok(student);
    }
    
    /**
     * Connexion étudiant
     * POST /api/students/login
     */
    @PostMapping("/login")
    public ResponseEntity<StudentDTO> login(@RequestBody Map<String, String> request, HttpSession session) {
        String email = request.get("email");
        String password = request.get("password");
        
        if (email == null || password == null) {
            return ResponseEntity.badRequest().build();
        }
        
        StudentDTO student = studentService.login(email, password);
        
        // Créer une session pour l'étudiant connecté
        session.setAttribute("studentEmail", student.email());
        session.setAttribute("studentId", student.id());
        
        return ResponseEntity.ok(student);
    }
    
    /**
     * Déconnexion étudiant
     * POST /api/students/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
    }
    
    /**
     * Récupérer le profil de l'étudiant connecté
     * GET /api/students/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<StudentDTO> getProfile(HttpSession session) {
        String email = (String) session.getAttribute("studentEmail");
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        StudentDTO student = studentService.getProfileByEmail(email);
        return ResponseEntity.ok(student);
    }
    
    /**
     * Mettre à jour le profil
     * PUT /api/students/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<StudentDTO> updateProfile(@RequestBody Map<String, String> request, HttpSession session) {
        String email = (String) session.getAttribute("studentEmail");
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String nom = request.get("nom");
        String prenom = request.get("prenom");
        String filiere = request.get("filiere");
        String campus = request.get("campus");
        
        if (nom == null || filiere == null || campus == null) {
            return ResponseEntity.badRequest().build();
        }
        
        StudentDTO student = studentService.updateProfile(email, nom, prenom, filiere, campus);
        return ResponseEntity.ok(student);
    }
    
    /**
     * Vérifier si l'étudiant est connecté
     * GET /api/students/check-auth
     */
    @GetMapping("/check-auth")
    public ResponseEntity<Map<String, Object>> checkAuth(HttpSession session) {
        String email = (String) session.getAttribute("studentEmail");
        Long studentId = (Long) session.getAttribute("studentId");
        
        if (email != null && studentId != null) {
            return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "email", email,
                "studentId", studentId
            ));
        }
        
        return ResponseEntity.ok(Map.of("authenticated", false));
    }
    
    /**
     * Demander la réinitialisation du mot de passe
     * POST /api/students/request-password-reset
     */
    @PostMapping("/request-password-reset")
    public ResponseEntity<Map<String, String>> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        String code = studentService.requestPasswordReset(email);
        
        if (code != null) {
            // L'email n'a pas pu être envoyé, retourner le code pour le développement
            return ResponseEntity.ok(Map.of(
                "message", "Code de réinitialisation généré (email non envoyé - vérifiez la configuration)",
                "code", code,
                "warning", "L'email n'a pas pu être envoyé. Utilisez ce code pour continuer."
            ));
        }
        
        return ResponseEntity.ok(Map.of("message", "Code de réinitialisation envoyé par email"));
    }
    
    /**
     * Réinitialiser le mot de passe avec le code
     * POST /api/students/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<StudentDTO> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String resetCode = request.get("resetCode");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");
        
        if (email == null || resetCode == null || newPassword == null || confirmPassword == null) {
            return ResponseEntity.badRequest().build();
        }
        
        StudentDTO student = studentService.resetPassword(email, resetCode, newPassword, confirmPassword);
        return ResponseEntity.ok(student);
    }
}

