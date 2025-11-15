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
  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${API_URL}/reviews`);
  }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${API_URL}/reviews/admin`);
  }

  createReview(formData: FormData): Observable<Review> {
    return this.http.post<Review>(`${API_URL}/reviews`, formData);
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

  // Helper pour obtenir l'URL de base (pour les images)
  getBaseUrl(): string {
    return BASE_URL;
  }
}

