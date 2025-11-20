package com.ccnb.association.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPReply;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
@Slf4j
public class FtpService {
    
    @Value("${ftp.host}")
    private String ftpHost;
    
    @Value("${ftp.port:21}")
    private int ftpPort;
    
    @Value("${ftp.username}")
    private String ftpUsername;
    
    @Value("${ftp.password}")
    private String ftpPassword;
    
    @Value("${ftp.base-path:/}")
    private String ftpBasePath;
    
    @Value("${ftp.base-url}")
    private String ftpBaseUrl;
    
    @Value("${ftp.passive-mode:true}")
    private boolean passiveMode;
    
    /**
     * Upload un fichier sur le serveur FTP
     * @param fileBytes Les bytes du fichier
     * @param remoteFileName Le nom du fichier sur le serveur FTP
     * @param remotePath Le chemin relatif sur le serveur (optionnel)
     * @return L'URL complète du fichier uploadé
     */
    public String uploadFile(byte[] fileBytes, String remoteFileName, String remotePath) throws IOException {
        FTPClient ftpClient = new FTPClient();
        
        try {
            // Connexion au serveur FTP
            ftpClient.connect(ftpHost, ftpPort);
            int replyCode = ftpClient.getReplyCode();
            
            if (!FTPReply.isPositiveCompletion(replyCode)) {
                throw new IOException("Échec de la connexion FTP. Code: " + replyCode);
            }
            
            // Authentification
            if (!ftpClient.login(ftpUsername, ftpPassword)) {
                throw new IOException("Échec de l'authentification FTP");
            }
            
            // Mode passif
            if (passiveMode) {
                ftpClient.enterLocalPassiveMode();
            }
            
            // Mode binaire pour les fichiers
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
            
            // Aller au répertoire de base
            if (ftpBasePath != null && !ftpBasePath.isEmpty() && !ftpBasePath.equals("/")) {
                String basePath = ftpBasePath.startsWith("/") ? ftpBasePath : "/" + ftpBasePath;
                if (!ftpClient.changeWorkingDirectory(basePath)) {
                    // Créer le répertoire s'il n'existe pas
                    createDirectory(ftpClient, basePath);
                    ftpClient.changeWorkingDirectory(basePath);
                }
            }
            
            // Créer le répertoire de destination si nécessaire
            if (remotePath != null && !remotePath.isEmpty()) {
                String fullPath = remotePath.startsWith("/") ? remotePath : "/" + remotePath;
                createDirectory(ftpClient, fullPath);
                ftpClient.changeWorkingDirectory(fullPath);
            }
            
            // Upload du fichier
            try (InputStream inputStream = new ByteArrayInputStream(fileBytes)) {
                boolean uploaded = ftpClient.storeFile(remoteFileName, inputStream);
                
                if (!uploaded) {
                    throw new IOException("Échec de l'upload du fichier: " + remoteFileName);
                }
            }
            
            // Construire l'URL (sans inclure base-path car base-url contient déjà le chemin public)
            String fileUrl = buildFileUrl(remotePath, remoteFileName);
            log.info("=== FTP UPLOAD SUCCESS ===");
            log.info("Fichier: {}", remoteFileName);
            log.info("Chemin FTP sur serveur: {}/{}", remotePath != null ? remotePath : "", remoteFileName);
            log.info("URL publique générée: {}", fileUrl);
            log.info("Taille du fichier: {} bytes", fileBytes.length);
            log.info("Base URL (publique): {}", ftpBaseUrl);
            log.info("Base Path (serveur FTP): {}", ftpBasePath);
            log.info("Upload Path (relatif): {}", remotePath);
            log.info("=========================");
            
            // Vérifier que l'URL ne contient pas base-path
            if (fileUrl.contains("/public_html/")) {
                log.error("ERREUR: L'URL contient '/public_html/' alors qu'elle ne devrait pas !");
                log.error("URL incorrecte: {}", fileUrl);
                // Corriger l'URL en supprimant /public_html/aeccb
                fileUrl = fileUrl.replace("/public_html/aeccb", "");
                log.info("URL corrigée: {}", fileUrl);
            }
            
            return fileUrl;
            
        } finally {
            if (ftpClient.isConnected()) {
                try {
                    ftpClient.logout();
                    ftpClient.disconnect();
                } catch (IOException e) {
                    log.error("Erreur lors de la déconnexion FTP", e);
                }
            }
        }
    }
    
    /**
     * Supprime un fichier du serveur FTP
     * @param remoteFilePath Le chemin complet du fichier sur le serveur FTP
     */
    public void deleteFile(String remoteFilePath) throws IOException {
        FTPClient ftpClient = new FTPClient();
        
        try {
            // Connexion au serveur FTP
            ftpClient.connect(ftpHost, ftpPort);
            int replyCode = ftpClient.getReplyCode();
            
            if (!FTPReply.isPositiveCompletion(replyCode)) {
                throw new IOException("Échec de la connexion FTP. Code: " + replyCode);
            }
            
            // Authentification
            if (!ftpClient.login(ftpUsername, ftpPassword)) {
                throw new IOException("Échec de l'authentification FTP");
            }
            
            // Mode passif
            if (passiveMode) {
                ftpClient.enterLocalPassiveMode();
            }
            
            // Aller au répertoire de base
            if (ftpBasePath != null && !ftpBasePath.isEmpty() && !ftpBasePath.equals("/")) {
                String basePath = ftpBasePath.startsWith("/") ? ftpBasePath : "/" + ftpBasePath;
                ftpClient.changeWorkingDirectory(basePath);
            }
            
            // Supprimer le fichier (chemin relatif depuis le répertoire de base)
            String filePath = remoteFilePath.startsWith("/") ? remoteFilePath.substring(1) : remoteFilePath;
            boolean deleted = ftpClient.deleteFile(filePath);
            
            if (!deleted) {
                log.warn("Impossible de supprimer le fichier: {}", remoteFilePath);
            } else {
                log.info("Fichier supprimé avec succès: {}", remoteFilePath);
            }
            
        } finally {
            if (ftpClient.isConnected()) {
                try {
                    ftpClient.logout();
                    ftpClient.disconnect();
                } catch (IOException e) {
                    log.error("Erreur lors de la déconnexion FTP", e);
                }
            }
        }
    }
    
    /**
     * Met à jour un fichier sur le serveur FTP (supprime l'ancien et upload le nouveau)
     * @param fileBytes Les bytes du nouveau fichier
     * @param remoteFileName Le nom du fichier sur le serveur FTP
     * @param remotePath Le chemin relatif sur le serveur (optionnel)
     * @param oldFilePath Le chemin de l'ancien fichier à supprimer (optionnel)
     * @return L'URL complète du fichier uploadé
     */
    public String updateFile(byte[] fileBytes, String remoteFileName, String remotePath, String oldFilePath) throws IOException {
        // Supprimer l'ancien fichier si fourni
        if (oldFilePath != null && !oldFilePath.isEmpty()) {
            try {
                deleteFile(oldFilePath);
            } catch (IOException e) {
                log.warn("Impossible de supprimer l'ancien fichier: {}", oldFilePath, e);
            }
        }
        
        // Upload le nouveau fichier
        return uploadFile(fileBytes, remoteFileName, remotePath);
    }
    
    /**
     * Crée un répertoire sur le serveur FTP
     */
    private void createDirectory(FTPClient ftpClient, String dirPath) throws IOException {
        String[] pathElements = dirPath.split("/");
        StringBuilder currentPath = new StringBuilder();
        
        for (String pathElement : pathElements) {
            if (pathElement.isEmpty()) {
                continue;
            }
            
            currentPath.append("/").append(pathElement);
            String path = currentPath.toString();
            
            if (!ftpClient.changeWorkingDirectory(path)) {
                if (ftpClient.makeDirectory(path)) {
                    log.info("Répertoire créé: {}", path);
                } else {
                    log.warn("Impossible de créer le répertoire: {}", path);
                }
            }
        }
    }
    
    /**
     * Construit l'URL complète du fichier
     * Note: ftpBaseUrl contient déjà le chemin complet (ex: http://college-dev.com/aeccb)
     * On ajoute seulement le remotePath (uploads) et le fileName
     * IMPORTANT: Ne JAMAIS inclure ftpBasePath dans l'URL publique
     */
    private String buildFileUrl(String remotePath, String fileName) {
        // Nettoyer ftpBaseUrl pour s'assurer qu'il ne contient pas de base-path
        String cleanBaseUrl = ftpBaseUrl;
        if (cleanBaseUrl.contains("/public_html/")) {
            log.warn("Base URL contient '/public_html/', nettoyage en cours...");
            cleanBaseUrl = cleanBaseUrl.replace("/public_html/aeccb", "");
            if (cleanBaseUrl.endsWith("/")) {
                cleanBaseUrl = cleanBaseUrl.substring(0, cleanBaseUrl.length() - 1);
            }
            cleanBaseUrl = cleanBaseUrl + "/aeccb";
            log.info("Base URL nettoyée: {}", cleanBaseUrl);
        }
        
        StringBuilder url = new StringBuilder(cleanBaseUrl);
        
        // S'assurer que l'URL de base se termine par /
        if (!url.toString().endsWith("/")) {
            url.append("/");
        }
        
        // Ne JAMAIS inclure ftpBasePath dans l'URL car ftpBaseUrl contient déjà le chemin complet
        // On ajoute seulement le remotePath (ex: "uploads") et le fileName
        
        if (remotePath != null && !remotePath.isEmpty()) {
            String path = remotePath.startsWith("/") ? remotePath.substring(1) : remotePath;
            if (!path.endsWith("/")) {
                path += "/";
            }
            url.append(path);
        }
        
        url.append(fileName);
        
        String finalUrl = url.toString();
        
        // Vérification finale : l'URL ne doit JAMAIS contenir /public_html/
        if (finalUrl.contains("/public_html/")) {
            log.error("ERREUR CRITIQUE: L'URL finale contient '/public_html/' !");
            log.error("URL incorrecte: {}", finalUrl);
            // Correction d'urgence
            finalUrl = finalUrl.replace("/public_html/aeccb", "");
            log.info("URL corrigée automatiquement: {}", finalUrl);
        }
        
        log.info("Construction URL - Base URL: {}, Remote Path: {}, File: {}", 
                cleanBaseUrl, remotePath, fileName);
        log.info("URL finale générée: {}", finalUrl);
        
        return finalUrl;
    }
    
    /**
     * Extrait le chemin relatif depuis une URL complète
     * Exemple: http://college-dev.com/aeccb/uploads/file.jpg -> uploads/file.jpg
     */
    public String extractRelativePathFromUrl(String fullUrl) {
        if (fullUrl == null || !fullUrl.startsWith(ftpBaseUrl)) {
            log.warn("URL ne commence pas par base-url: {} (base-url: {})", fullUrl, ftpBaseUrl);
            return null;
        }
        
        String relativePath = fullUrl.substring(ftpBaseUrl.length());
        if (relativePath.startsWith("/")) {
            relativePath = relativePath.substring(1);
        }
        
        log.debug("Extraction chemin - URL: {}, Chemin relatif: {}", fullUrl, relativePath);
        return relativePath;
    }
}

