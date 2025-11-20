package com.ccnb.association.service;

import com.ccnb.association.entity.ActivityPhoto;
import com.ccnb.association.entity.ActivityPhotoLike;
import com.ccnb.association.repository.ActivityPhotoLikeRepository;
import com.ccnb.association.repository.ActivityPhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActivityPhotoLikeService {
    
    private final ActivityPhotoLikeRepository likeRepository;
    private final ActivityPhotoRepository photoRepository;
    
    @Transactional
    public void toggleLike(Long photoId, String voterIp) {
        ActivityPhoto photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Activity photo not found"));
        
        if (likeRepository.existsByActivityPhotoAndVoterIp(photo, voterIp)) {
            likeRepository.deleteByActivityPhotoAndVoterIp(photo, voterIp);
        } else {
            ActivityPhotoLike like = new ActivityPhotoLike();
            like.setActivityPhoto(photo);
            like.setVoterIp(voterIp);
            likeRepository.save(like);
        }
    }
    
    @Transactional(readOnly = true)
    public boolean hasLiked(Long photoId, String voterIp) {
        return photoRepository.findById(photoId)
                .map(photo -> likeRepository.existsByActivityPhotoAndVoterIp(photo, voterIp))
                .orElse(false);
    }
}

