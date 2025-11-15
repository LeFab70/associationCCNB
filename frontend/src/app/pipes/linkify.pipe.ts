import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'linkify',
  standalone: true
})
export class LinkifyPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string): SafeHtml {
    if (!text) return this.sanitizer.bypassSecurityTrustHtml('');

    // Échapper les caractères HTML pour éviter les injections XSS
    const escapeHtml = (str: string): string => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };

    // Pattern pour détecter les URLs (plus précis)
    const urlPattern = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;
    
    // Diviser le texte en parties (URLs et texte normal)
    const parts: Array<{ type: 'text' | 'url'; content: string }> = [];
    let lastIndex = 0;
    let match;
    
    // Réinitialiser le regex pour une nouvelle recherche
    urlPattern.lastIndex = 0;
    
    while ((match = urlPattern.exec(text)) !== null) {
      // Ajouter le texte avant l'URL
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      
      // Ajouter l'URL
      parts.push({ type: 'url', content: match[0] });
      lastIndex = match.index + match[0].length;
    }
    
    // Ajouter le texte restant (ou tout le texte si aucune URL n'a été trouvée)
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    } else if (parts.length === 0) {
      // Si aucune URL n'a été trouvée et aucun texte n'a été ajouté
      parts.push({ type: 'text', content: text });
    }
    
    // Construire le HTML
    let html = '';
    for (const part of parts) {
      if (part.type === 'url') {
        // Traiter l'URL
        let href = part.content;
        if (href.toLowerCase().startsWith('www.')) {
          href = 'http://' + href;
        }
        
        // Échapper l'URL pour l'affichage et l'href
        const escapedUrl = escapeHtml(part.content);
        const escapedHref = escapeHtml(href);
        
        // Créer le lien
        html += `<a href="${escapedHref}" target="_blank" rel="noopener noreferrer" class="text-ccnb-blue hover:text-ccnb-red underline break-all">${escapedUrl}</a>`;
      } else {
        // Échapper le texte normal et préserver les sauts de ligne
        const escapedText = escapeHtml(part.content);
        html += escapedText.replace(/\n/g, '<br>');
      }
    }
    
    // Utiliser bypassSecurityTrustHtml car nous avons déjà échappé le contenu
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

