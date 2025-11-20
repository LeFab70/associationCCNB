import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;
const BASE_URL = environment.apiUrl.replace('/api', ''); // Pour les uploads

export interface Proposal {
  id: number;
  name: string;
  proposalText: string;
  photoUrl?: string;
  createdAt: string;
  voteCount: number;
  hasVoted: boolean;
  isActive?: boolean;
}

export interface Review {
  id: number;
  name: string;
  reviewText: string;
  photoUrl?: string;
  createdAt: string;
  isApproved?: boolean;
  likeCount: number;
  hasLiked: boolean;
  activityId?: number;
  activityTitle?: string;
}

export interface Comment {
  id: number;
  name: string;
  commentText: string;
  createdAt: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityPhoto {
  id: number;
  photoUrl: string;
  displayOrder: number;
  createdAt: string;
  likeCount?: number;
  hasLiked?: boolean;
  commentCount?: number;
}

export interface ActivityPhotoComment {
  id: number;
  name: string;
  commentText: string;
  createdAt: string;
  isApproved?: boolean;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  programme?: string;
  lieu?: string;
  dateActivite?: string;
  heureActivite?: string;
  isFree?: boolean;
  prix?: number;
  reservationRequired?: boolean;
  reservationUrl?: string;
  imageUrl?: string;
  createdAt: string;
  likeCount: number;
  hasLiked: boolean;
  isActive?: boolean;
  isPublished?: boolean;
  photos?: ActivityPhoto[];
  reviewCount?: number;
  commentCount?: number;
}

export interface Admin {
  id: number;
  username: string;
  isActive: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  // Proposals
  getProposals(): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(`${API_URL}/proposals`);
  }

  createProposal(formData: FormData): Observable<Proposal> {
    return this.http.post<Proposal>(`${API_URL}/proposals`, formData);
  }

  toggleVote(proposalId: number): Observable<Proposal> {
    return this.http.post<Proposal>(`${API_URL}/proposals/${proposalId}/vote`, {});
  }

  deleteProposal(proposalId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/proposals/${proposalId}`);
  }

  getAllProposalsForAdmin(): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(`${API_URL}/proposals/admin`);
  }

  searchProposals(searchTerm: string): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(`${API_URL}/proposals/search?q=${encodeURIComponent(searchTerm)}`);
  }

  toggleProposalStatus(proposalId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/proposals/${proposalId}/status`, {});
  }

  // Reviews
  getReviewsByActivityId(activityId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${API_URL}/reviews/activity/${activityId}`);
  }

  createReview(activityId: number, formData: FormData): Observable<Review> {
    return this.http.post<Review>(`${API_URL}/reviews/activity/${activityId}`, formData);
  }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${API_URL}/reviews/admin`);
  }

  createReviewAsAdmin(activityId: number, formData: FormData): Observable<Review> {
    return this.http.post<Review>(`${API_URL}/reviews/admin/activity/${activityId}`, formData);
  }

  toggleReviewApproval(reviewId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/reviews/${reviewId}/approval`, {});
  }

  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/reviews/${reviewId}`);
  }

  // Contacts
  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${API_URL}/contacts/admin`);
  }

  createContact(contact: { name: string; email: string; message: string }): Observable<Contact> {
    return this.http.post<Contact>(`${API_URL}/contacts`, contact);
  }

  markContactAsRead(contactId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/contacts/${contactId}/read`, {});
  }

  deleteContact(contactId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/contacts/${contactId}`);
  }

  // Admin
  adminLogin(credentials: { username: string; password: string }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${API_URL}/admin/login`, credentials);
  }

  // Admin Account Management
  getAllAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${API_URL}/admin/accounts`);
  }

  createAdmin(admin: { username: string; password: string }): Observable<Admin> {
    return this.http.post<Admin>(`${API_URL}/admin/accounts`, admin);
  }

  toggleAdminStatus(adminId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/admin/accounts/${adminId}/status`, {});
  }

  changeAdminPassword(adminId: number, password: string): Observable<void> {
    return this.http.put<void>(`${API_URL}/admin/accounts/${adminId}/password`, { password });
  }

  deleteAdmin(adminId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/admin/accounts/${adminId}`);
  }

  // Likes
  toggleLike(reviewId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${API_URL}/likes/review/${reviewId}`, {});
  }

  // Comments
  getComments(reviewId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${API_URL}/comments/review/${reviewId}`);
  }

  createComment(reviewId: number, comment: { name: string; commentText: string }): Observable<Comment> {
    return this.http.post<Comment>(`${API_URL}/comments/review/${reviewId}`, comment);
  }

  // Activities
  getActivities(): Observable<Activity[]> {
    // Retourne uniquement les activités publiées (confirmées)
    return this.http.get<Activity[]>(`${API_URL}/activities`);
  }

  getProposedActivities(): Observable<Activity[]> {
    // Retourne les activités proposées (en attente de vote)
    return this.http.get<Activity[]>(`${API_URL}/activities/proposed`);
  }

  getPublishedActivities(): Observable<Activity[]> {
    // Retourne les activités publiées (confirmées)
    return this.http.get<Activity[]>(`${API_URL}/activities/published`);
  }

  getPastActivities(): Observable<Activity[]> {
    // Retourne les activités passées (isActive = false) pour les étudiants
    return this.http.get<Activity[]>(`${API_URL}/activities/past`);
  }

  getActivityById(id: number): Observable<Activity> {
    return this.http.get<Activity>(`${API_URL}/activities/${id}`);
  }

  getAllActivitiesForAdmin(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_URL}/activities/admin`);
  }

  getProposedActivitiesForAdmin(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_URL}/activities/admin/proposed`);
  }

  getPublishedActivitiesForAdmin(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_URL}/activities/admin/published`);
  }

  getPastActivitiesForAdmin(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_URL}/activities/admin/past`);
  }

  createActivity(formData: FormData): Observable<Activity> {
    return this.http.post<Activity>(`${API_URL}/activities`, formData);
  }

  toggleActivityLike(activityId: number): Observable<Activity> {
    return this.http.post<Activity>(`${API_URL}/activities/${activityId}/like`, {});
  }

  toggleActivityStatus(activityId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/activities/${activityId}/status`, {});
  }

  publishActivity(activityId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/activities/${activityId}/publish`, {});
  }

  unpublishActivity(activityId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/activities/${activityId}/unpublish`, {});
  }

  deleteActivity(activityId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/activities/${activityId}`);
  }

  addPhotoToActivity(activityId: number, formData: FormData): Observable<ActivityPhoto> {
    return this.http.post<ActivityPhoto>(`${API_URL}/activities/${activityId}/photos`, formData);
  }

  deleteActivityPhoto(photoId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/activities/photos/${photoId}`);
  }

  // Activity Photo Likes and Comments
  toggleActivityPhotoLike(photoId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${API_URL}/activity-photos/${photoId}/like`, {});
  }

  createActivityPhotoComment(photoId: number, name: string, commentText: string): Observable<ActivityPhotoComment> {
    return this.http.post<ActivityPhotoComment>(`${API_URL}/activity-photos/${photoId}/comments`, {
      name,
      commentText
    });
  }

  getActivityPhotoComments(photoId: number): Observable<ActivityPhotoComment[]> {
    return this.http.get<ActivityPhotoComment[]>(`${API_URL}/activity-photos/${photoId}/comments`);
  }

  // Admin methods for photo comments moderation
  getActivityPhotoCommentsForAdmin(photoId: number): Observable<ActivityPhotoComment[]> {
    return this.http.get<ActivityPhotoComment[]>(`${API_URL}/activity-photos/admin/${photoId}/comments`);
  }

  getPendingPhotoComments(): Observable<ActivityPhotoComment[]> {
    return this.http.get<ActivityPhotoComment[]>(`${API_URL}/activity-photos/admin/comments/pending`);
  }

  approvePhotoComment(commentId: number): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${API_URL}/activity-photos/admin/comments/${commentId}/approve`, {});
  }

  rejectPhotoComment(commentId: number): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${API_URL}/activity-photos/admin/comments/${commentId}/reject`, {});
  }

  deletePhotoComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/activity-photos/admin/comments/${commentId}`);
  }

  // File Upload Methods
  uploadFile(file: File): Observable<{ success: boolean; message: string; fileUrl: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; message: string; fileUrl: string; fileName: string }>(`${API_URL}/files/upload`, formData);
  }

  updateFile(file: File, oldFileUrl: string): Observable<{ success: boolean; message: string; fileUrl: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('oldFileUrl', oldFileUrl);
    return this.http.put<{ success: boolean; message: string; fileUrl: string; fileName: string }>(`${API_URL}/files/update`, formData);
  }

  deleteFile(fileUrl: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${API_URL}/files/delete`, {
      params: { fileUrl }
    });
  }

  uploadMultipleFiles(files: File[]): Observable<{ success: boolean; message: string; uploadedFiles: Record<string, string>; successCount: number; errorCount: number }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return this.http.post<{ success: boolean; message: string; uploadedFiles: Record<string, string>; successCount: number; errorCount: number }>(`${API_URL}/files/upload-multiple`, formData);
  }

  // Helper pour obtenir l'URL de base (pour les images)
  getBaseUrl(): string {
    return BASE_URL;
  }
}

