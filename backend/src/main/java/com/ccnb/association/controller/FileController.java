package com.ccnb.association.controller;

import com.ccnb.association.exceptions.BadRequestException;
import com.ccnb.association.exceptions.ResourceNotFoundException;
import com.ccnb.association.service.FileStorageService;
import com.ccnb.association.service.FtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class FileController {
    
    private final FileStorageService fileStorageService;
    private final FtpService ftpService;
    
    /**
     * Upload un fichier
     * POST /api/files/upload
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Le fichier est requis");
        }
        
        try {
            log.info("=== DÉBUT UPLOAD FICHIER ===");
            log.info("Nom original: {}", file.getOriginalFilename());
            log.info("Taille: {} bytes", file.getSize());
            log.info("Type: {}", file.getContentType());
            
            String fileUrl = fileStorageService.storeFile(file);
            
            log.info("=== FIN UPLOAD FICHIER ===");
            log.info("URL retournée: {}", fileUrl);
            log.info("========================");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Fichier uploadé avec succès");
            response.put("fileUrl", fileUrl);
            response.put("fileName", file.getOriginalFilename());
            response.put("fileSize", file.getSize());
            response.put("contentType", file.getContentType());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Erreur lors de l'upload du fichier", e);
            throw new BadRequestException("Erreur lors de l'upload du fichier: " + e.getMessage());
        }
    }
    
    /**
     * Met à jour un fichier existant
     * PUT /api/files/update
     */
    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("oldFileUrl") String oldFileUrl) {
        
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Le fichier est requis");
        }
        
        if (oldFileUrl == null || oldFileUrl.isEmpty()) {
            throw new BadRequestException("L'URL de l'ancien fichier est requise");
        }
        
        try {
            String newFileUrl = fileStorageService.updateFile(file, oldFileUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Fichier mis à jour avec succès");
            response.put("fileUrl", newFileUrl);
            response.put("fileName", file.getOriginalFilename());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du fichier", e);
            throw new BadRequestException("Erreur lors de la mise à jour du fichier: " + e.getMessage());
        }
    }
    
    /**
     * Supprime un fichier
     * DELETE /api/files/delete
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteFile(@RequestParam("fileUrl") String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            throw new BadRequestException("L'URL du fichier est requise");
        }
        
        try {
            fileStorageService.deleteFile(fileUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Fichier supprimé avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors de la suppression du fichier", e);
            throw new BadRequestException("Erreur lors de la suppression du fichier: " + e.getMessage());
        }
    }
    
    /**
     * Test de connexion FTP
     * GET /api/files/test-ftp
     */
    @GetMapping(value = {"/test-ftp", "/test-ftp/"}, produces = "application/json")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> testFtpConnection() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Tester la connexion FTP en uploadant un fichier de test directement
            String testContent = "Test FTP Connection - " + System.currentTimeMillis();
            byte[] testBytes = testContent.getBytes();
            String testFileName = "test-connection-" + System.currentTimeMillis() + ".txt";
            
            // Utiliser directement le FtpService
            String fileUrl = ftpService.uploadFile(testBytes, testFileName, "test");
            
            response.put("success", true);
            response.put("message", "Connexion FTP réussie");
            response.put("testFileUrl", fileUrl);
            response.put("ftpEnabled", true);
            response.put("testFileName", testFileName);
            response.put("instructions", "Ouvrez l'URL dans votre navigateur pour vérifier que le fichier est accessible");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur lors du test FTP", e);
            response.put("success", false);
            response.put("message", "Erreur de connexion FTP: " + e.getMessage());
            response.put("ftpEnabled", true);
            response.put("error", e.getClass().getSimpleName());
            response.put("errorDetails", e.getMessage());
            if (e.getCause() != null) {
                response.put("cause", e.getCause().getMessage());
            }
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Upload multiple files
     * POST /api/files/upload-multiple
     */
    @PostMapping("/upload-multiple")
    public ResponseEntity<Map<String, Object>> uploadMultipleFiles(@RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new BadRequestException("Au moins un fichier est requis");
        }
        
        Map<String, Object> response = new HashMap<>();
        Map<String, String> uploadedFiles = new HashMap<>();
        int successCount = 0;
        int errorCount = 0;
        
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                try {
                    String fileUrl = fileStorageService.storeFile(file);
                    uploadedFiles.put(file.getOriginalFilename(), fileUrl);
                    successCount++;
                } catch (Exception e) {
                    log.error("Erreur lors de l'upload du fichier: {}", file.getOriginalFilename(), e);
                    errorCount++;
                }
            }
        }
        
        response.put("success", true);
        response.put("message", String.format("%d fichier(s) uploadé(s) avec succès, %d erreur(s)", successCount, errorCount));
        response.put("uploadedFiles", uploadedFiles);
        response.put("successCount", successCount);
        response.put("errorCount", errorCount);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

