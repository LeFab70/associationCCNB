package com.ccnb.association.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {
    
    private final Path fileStorageLocation;
    private final FtpService ftpService;
    private final ImageOptimizationService imageOptimizationService;
    private final boolean ftpEnabled;
    private final String ftpUploadPath;
    
    public FileStorageService(
            @Value("${file.upload-dir}") String uploadDir,
            @Value("${ftp.enabled:true}") boolean ftpEnabled,
            @Value("${ftp.upload-path:uploads}") String ftpUploadPath,
            FtpService ftpService,
            ImageOptimizationService imageOptimizationService) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.ftpService = ftpService;
        this.imageOptimizationService = imageOptimizationService;
        this.ftpEnabled = ftpEnabled;
        this.ftpUploadPath = ftpUploadPath;
        
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }
    
    /**
     * Stocke un fichier (localement ou via FTP selon la configuration)
     * Les images sont automatiquement optimisées
     */
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String fileName = UUID.randomUUID().toString() + extension;
            
            // Si FTP est activé, uploader via FTP
            if (ftpEnabled) {
                log.info("=== UPLOAD FTP ACTIVÉ ===");
                log.info("Nom du fichier original: {}", originalFilename);
                log.info("Nom du fichier généré: {}", fileName);
                log.info("Extension: {}", extension);
                log.info("Chemin d'upload FTP: {}", ftpUploadPath);
                
                byte[] fileBytes;
                
                // Optimiser les images avant l'upload
                if (imageOptimizationService.isImage(file)) {
                    log.info("Fichier détecté comme image, optimisation en cours...");
                    try {
                        fileBytes = imageOptimizationService.optimizeImage(file);
                        log.info("Image optimisée: {} bytes -> {} bytes", file.getSize(), fileBytes.length);
                        // Changer l'extension en .jpg si c'était une image
                        if (!extension.equalsIgnoreCase(".jpg") && !extension.equalsIgnoreCase(".jpeg")) {
                            fileName = fileName.substring(0, fileName.lastIndexOf(".")) + ".jpg";
                            log.info("Extension changée en .jpg: {}", fileName);
                        }
                    } catch (Exception e) {
                        log.warn("Erreur lors de l'optimisation de l'image, utilisation du fichier original", e);
                        fileBytes = file.getBytes();
                    }
                } else {
                    log.info("Fichier non-image, upload direct");
                    fileBytes = file.getBytes();
                }
                
                String fileUrl = ftpService.uploadFile(fileBytes, fileName, ftpUploadPath);
                log.info("=== URL RETOURNÉE PAR FileStorageService ===");
                log.info("URL: {}", fileUrl);
                log.info("===========================================");
                return fileUrl;
            } else {
                // Stockage local (fallback)
                Path targetLocation = this.fileStorageLocation.resolve(fileName);
                
                // Optimiser les images avant le stockage local
                if (imageOptimizationService.isImage(file)) {
                    try {
                        byte[] optimizedBytes = imageOptimizationService.optimizeImage(file);
                        Files.write(targetLocation, optimizedBytes);
                    } catch (Exception e) {
                        log.warn("Erreur lors de l'optimisation de l'image, utilisation du fichier original", e);
                        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                    }
                } else {
                    Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                }
                
                return fileName;
            }
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }
    
    /**
     * Met à jour un fichier existant
     */
    public String updateFile(MultipartFile file, String oldFileUrl) {
        if (file == null || file.isEmpty()) {
            return oldFileUrl; // Retourner l'ancienne URL si pas de nouveau fichier
        }
        
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String fileName = UUID.randomUUID().toString() + extension;
            
            // Si FTP est activé, mettre à jour via FTP
            if (ftpEnabled) {
                byte[] fileBytes;
                
                // Optimiser les images avant l'upload
                if (imageOptimizationService.isImage(file)) {
                    try {
                        fileBytes = imageOptimizationService.optimizeImage(file);
                        if (!extension.equalsIgnoreCase(".jpg") && !extension.equalsIgnoreCase(".jpeg")) {
                            fileName = fileName.substring(0, fileName.lastIndexOf(".")) + ".jpg";
                        }
                    } catch (Exception e) {
                        log.warn("Erreur lors de l'optimisation de l'image, utilisation du fichier original", e);
                        fileBytes = file.getBytes();
                    }
                } else {
                    fileBytes = file.getBytes();
                }
                
                String oldFilePath = ftpService.extractRelativePathFromUrl(oldFileUrl);
                String fileUrl = ftpService.updateFile(fileBytes, fileName, ftpUploadPath, oldFilePath);
                log.info("Fichier mis à jour via FTP: {}", fileUrl);
                return fileUrl;
            } else {
                // Stockage local (fallback)
                // Supprimer l'ancien fichier
                if (oldFileUrl != null && !oldFileUrl.isEmpty()) {
                    try {
                        Path oldFilePath = this.fileStorageLocation.resolve(oldFileUrl);
                        Files.deleteIfExists(oldFilePath);
                    } catch (Exception e) {
                        log.warn("Impossible de supprimer l'ancien fichier", e);
                    }
                }
                
                Path targetLocation = this.fileStorageLocation.resolve(fileName);
                
                // Optimiser les images avant le stockage local
                if (imageOptimizationService.isImage(file)) {
                    try {
                        byte[] optimizedBytes = imageOptimizationService.optimizeImage(file);
                        Files.write(targetLocation, optimizedBytes);
                    } catch (Exception e) {
                        log.warn("Erreur lors de l'optimisation de l'image, utilisation du fichier original", e);
                        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                    }
                } else {
                    Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                }
                
                return fileName;
            }
        } catch (IOException ex) {
            throw new RuntimeException("Could not update file. Please try again!", ex);
        }
    }
    
    /**
     * Obtient le service FTP (pour les tests)
     */
    public FtpService getFtpService() {
        return ftpService;
    }
    
    /**
     * Supprime un fichier
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }
        
        try {
            if (ftpEnabled) {
                String relativePath = ftpService.extractRelativePathFromUrl(fileUrl);
                if (relativePath != null) {
                    ftpService.deleteFile(relativePath);
                }
            } else {
                // Suppression locale
                Path filePath = this.fileStorageLocation.resolve(fileUrl);
                Files.deleteIfExists(filePath);
            }
        } catch (Exception ex) {
            log.error("Erreur lors de la suppression du fichier: {}", fileUrl, ex);
            throw new RuntimeException("Could not delete file. Please try again!", ex);
        }
    }
}

