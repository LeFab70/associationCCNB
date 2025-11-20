package com.ccnb.association.service;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
@Slf4j
public class ImageOptimizationService {
    
    private static final int MAX_WIDTH = 1920;
    private static final int MAX_HEIGHT = 1080;
    private static final double QUALITY = 0.85;
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    
    /**
     * Optimise une image en réduisant sa taille et sa qualité si nécessaire
     * @param file Le fichier image à optimiser
     * @return Le fichier optimisé sous forme de byte array
     */
    public byte[] optimizeImage(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Le fichier n'est pas une image");
        }
        
        String format = getImageFormat(contentType);
        if (format == null) {
            throw new IllegalArgumentException("Format d'image non supporté: " + contentType);
        }
        
        try (InputStream inputStream = file.getInputStream()) {
            BufferedImage originalImage = ImageIO.read(inputStream);
            
            if (originalImage == null) {
                throw new IOException("Impossible de lire l'image");
            }
            
            int originalWidth = originalImage.getWidth();
            int originalHeight = originalImage.getHeight();
            
            // Calculer les nouvelles dimensions en préservant le ratio
            int newWidth = originalWidth;
            int newHeight = originalHeight;
            
            if (originalWidth > MAX_WIDTH || originalHeight > MAX_HEIGHT) {
                double ratio = Math.min(
                    (double) MAX_WIDTH / originalWidth,
                    (double) MAX_HEIGHT / originalHeight
                );
                newWidth = (int) (originalWidth * ratio);
                newHeight = (int) (originalHeight * ratio);
            }
            
            // Créer l'image optimisée
            BufferedImage optimizedImage = Thumbnails.of(originalImage)
                    .size(newWidth, newHeight)
                    .outputFormat(format)
                    .outputQuality(QUALITY)
                    .asBufferedImage();
            
            // Convertir en byte array
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(optimizedImage, format, baos);
            byte[] optimizedBytes = baos.toByteArray();
            
            // Si le fichier est encore trop gros, réduire davantage la qualité
            int attempts = 0;
            double currentQuality = QUALITY;
            while (optimizedBytes.length > MAX_FILE_SIZE && attempts < 5) {
                currentQuality -= 0.1;
                if (currentQuality < 0.3) {
                    currentQuality = 0.3; // Qualité minimale
                }
                
                optimizedImage = Thumbnails.of(originalImage)
                        .size(newWidth, newHeight)
                        .outputFormat(format)
                        .outputQuality(currentQuality)
                        .asBufferedImage();
                
                baos.reset();
                ImageIO.write(optimizedImage, format, baos);
                optimizedBytes = baos.toByteArray();
                attempts++;
            }
            
            log.info("Image optimisée: {}x{} -> {}x{}, taille: {} bytes", 
                    originalWidth, originalHeight, newWidth, newHeight, optimizedBytes.length);
            
            return optimizedBytes;
        }
    }
    
    /**
     * Vérifie si un fichier est une image
     */
    public boolean isImage(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }
    
    /**
     * Obtient le format d'image à partir du content type
     */
    private String getImageFormat(String contentType) {
        if (contentType == null) {
            return null;
        }
        
        return switch (contentType.toLowerCase()) {
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/png" -> "png";
            case "image/gif" -> "gif";
            case "image/webp" -> "webp";
            default -> null;
        };
    }
}

