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
  id?: number;
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
  markedAsPastAt?: string;
  autoDeleteDelayDays?: number;
  votingDeadline?: string;
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
  private readonly credentials = { withCredentials: true };

  // Proposals
  getProposals(): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(`${API_URL}/proposals`, this.credentials);
  }

  createProposal(formData: FormData): Observable<Proposal> {
    return this.http.post<Proposal>(`${API_URL}/proposals`, formData, this.credentials);
  }

  toggleVote(proposalId: number): Observable<Proposal> {
    return this.http.post<Proposal>(`${API_URL}/proposals/${proposalId}/vote`, {}, this.credentials);
  }

  deleteProposal(proposalId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/proposals/${proposalId}`, this.credentials);
  }

  getAllProposalsForAdmin(): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(`${API_URL}/proposals/admin`, this.credentials);
  }

  searchProposals(searchTerm: string): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(`${API_URL}/proposals/search?q=${encodeURIComponent(searchTerm)}`, this.credentials);
  }

  toggleProposalStatus(proposalId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/proposals/${proposalId}/status`, {}, this.credentials);
  }

  convertProposalToActivity(proposalId: number, votingDeadline: string): Observable<Activity> {
    return this.http.post<Activity>(`${API_URL}/proposals/${proposalId}/convert-to-activity`, null, {
      params: { votingDeadline },
      ...this.credentials
    });
  }

  // Reviews
  getReviewsByActivityId(activityId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${API_URL}/reviews/activity/${activityId}`, this.credentials);
  }

  createReview(activityId: number, formData: FormData): Observable<Review> {
    return this.http.post<Review>(`${API_URL}/reviews/activity/${activityId}`, formData, this.credentials);
  }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${API_URL}/reviews/admin`, this.credentials);
  }

  createReviewAsAdmin(activityId: number, formData: FormData): Observable<Review> {
    return this.http.post<Review>(`${API_URL}/reviews/admin/activity/${activityId}`, formData, this.credentials);
  }

  toggleReviewApproval(reviewId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/reviews/${reviewId}/approval`, {}, this.credentials);
  }

  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/reviews/${reviewId}`, this.credentials);
  }

  // Contacts
  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${API_URL}/contacts/admin`, this.credentials);
  }

  createContact(contact: { name: string; email: string; message: string }): Observable<Contact> {
    return this.http.post<Contact>(`${API_URL}/contacts`, contact, this.credentials);
  }

  markContactAsRead(contactId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/contacts/${contactId}/read`, {}, this.credentials);
  }

  deleteContact(contactId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/contacts/${contactId}`, this.credentials);
  }

  // Admin
  adminLogin(credentials: { username: string; password: string }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${API_URL}/admin/login`, credentials, this.credentials);
  }

  // Admin Account Management
  getAllAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${API_URL}/admin/accounts`, this.credentials);
  }

  createAdmin(admin: { username: string; password: string }): Observable<Admin> {
    return this.http.post<Admin>(`${API_URL}/admin/accounts`, admin, this.credentials);
  }

  toggleAdminStatus(adminId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/admin/accounts/${adminId}/status`, {}, this.credentials);
  }

  changeAdminPassword(adminId: number, password: string): Observable<void> {
    return this.http.put<void>(`${API_URL}/admin/accounts/${adminId}/password`, { password }, this.credentials);
  }

  deleteAdmin(adminId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/admin/accounts/${adminId}`, this.credentials);
  }

  // Likes
  toggleLike(reviewId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${API_URL}/likes/review/${reviewId}`, {}, this.credentials);
  }

  // Comments
  getComments(reviewId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${API_URL}/comments/review/${reviewId}`, this.credentials);
  }

  createComment(reviewId: number, comment: { name: string; commentText: string }): Observable<Comment> {
    return this.http.post<Comment>(`${API_URL}/comments/review/${reviewId}`, comment, this.credentials);
  }

  // Activities
  getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_URL}/activities`, this.credentials);
  }

  getProposedActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_URL}/activities/proposed`, this.credentials);
  }

  getPublishedActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_URL}/activities/published`, this.credentials);
  }

  getPastActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_URL}/activities/past`, this.credentials);
  }

  getActivityById(id: number): Observable<Activity> {
    return this.http.get<Activity>(`${API_URL}/activities/${id}`, this.credentials);
  }

  getAllActivitiesForAdmin(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_URL}/activities/admin`, this.credentials);
  }

  getProposedActivitiesForAdmin(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_URL}/activities/admin/proposed`, this.credentials);
  }

  getPublishedActivitiesForAdmin(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_URL}/activities/admin/published`, this.credentials);
  }

  getPastActivitiesForAdmin(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${API_URL}/activities/admin/past`, this.credentials);
  }

  createActivity(formData: FormData): Observable<Activity> {
    return this.http.post<Activity>(`${API_URL}/activities`, formData, this.credentials);
  }

  toggleActivityLike(activityId: number): Observable<Activity> {
    return this.http.post<Activity>(`${API_URL}/activities/${activityId}/like`, {}, this.credentials);
  }

  toggleActivityStatus(activityId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/activities/${activityId}/status`, {}, this.credentials);
  }

  publishActivity(activityId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/activities/${activityId}/publish`, {}, this.credentials);
  }

  unpublishActivity(activityId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/activities/${activityId}/unpublish`, {}, this.credentials);
  }

  deleteActivity(activityId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/activities/${activityId}`, this.credentials);
  }

  addPhotoToActivity(activityId: number, formData: FormData): Observable<ActivityPhoto> {
    return this.http.post<ActivityPhoto>(`${API_URL}/activities/${activityId}/photos`, formData, this.credentials);
  }

  deleteActivityPhoto(photoId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/activities/photos/${photoId}`, this.credentials);
  }

  // Activity Photo Likes and Comments
  toggleActivityPhotoLike(photoId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${API_URL}/activity-photos/${photoId}/like`, {}, this.credentials);
  }

  createActivityPhotoComment(photoId: number, name: string, commentText: string): Observable<ActivityPhotoComment> {
    return this.http.post<ActivityPhotoComment>(`${API_URL}/activity-photos/${photoId}/comments`, {
      name,
      commentText
    }, this.credentials);
  }

  getActivityPhotoComments(photoId: number): Observable<ActivityPhotoComment[]> {
    return this.http.get<ActivityPhotoComment[]>(`${API_URL}/activity-photos/${photoId}/comments`, this.credentials);
  }

  // Admin methods for photo comments moderation
  getActivityPhotoCommentsForAdmin(photoId: number): Observable<ActivityPhotoComment[]> {
    return this.http.get<ActivityPhotoComment[]>(`${API_URL}/activity-photos/admin/${photoId}/comments`, this.credentials);
  }

  getPendingPhotoComments(): Observable<ActivityPhotoComment[]> {
    return this.http.get<ActivityPhotoComment[]>(`${API_URL}/activity-photos/admin/comments/pending`, this.credentials);
  }

  approvePhotoComment(commentId: number): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${API_URL}/activity-photos/admin/comments/${commentId}/approve`, {}, this.credentials);
  }

  rejectPhotoComment(commentId: number): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${API_URL}/activity-photos/admin/comments/${commentId}/reject`, {}, this.credentials);
  }

  deletePhotoComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/activity-photos/admin/comments/${commentId}`, this.credentials);
  }

  // File Upload Methods
  uploadFile(file: File): Observable<{ success: boolean; message: string; fileUrl: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; message: string; fileUrl: string; fileName: string }>(`${API_URL}/files/upload`, formData, this.credentials);
  }

  updateFile(file: File, oldFileUrl: string): Observable<{ success: boolean; message: string; fileUrl: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('oldFileUrl', oldFileUrl);
    return this.http.put<{ success: boolean; message: string; fileUrl: string; fileName: string }>(`${API_URL}/files/update`, formData, this.credentials);
  }

  deleteFile(fileUrl: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${API_URL}/files/delete`, {
      params: { fileUrl },
      ...this.credentials
    });
  }

  uploadMultipleFiles(files: File[]): Observable<{ success: boolean; message: string; uploadedFiles: Record<string, string>; successCount: number; errorCount: number }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return this.http.post<{ success: boolean; message: string; uploadedFiles: Record<string, string>; successCount: number; errorCount: number }>(`${API_URL}/files/upload-multiple`, formData, this.credentials);
  }

  // Helper pour obtenir l'URL de base (pour les images)
  getBaseUrl(): string {
    return BASE_URL;
  }
}
