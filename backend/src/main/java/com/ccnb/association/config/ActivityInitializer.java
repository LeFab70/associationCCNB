package com.ccnb.association.config;

import com.ccnb.association.entity.Activity;
import com.ccnb.association.repository.ActivityRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ActivityInitializer {

    private final ActivityRepository activityRepository;

    @PostConstruct
    public void init() {
                // Mettre à jour les activités existantes pour s'assurer qu'elles ont les valeurs par défaut
                List<Activity> existingActivities = activityRepository.findAll();
                boolean needsUpdate = false;
                for (Activity activity : existingActivities) {
                    if (activity.getIsFree() == null || activity.getReservationRequired() == null || activity.getIsPublished() == null) {
                        if (activity.getIsFree() == null) {
                            activity.setIsFree(true);
                        }
                        if (activity.getReservationRequired() == null) {
                            activity.setReservationRequired(false);
                        }
                        if (activity.getIsPublished() == null) {
                            activity.setIsPublished(false); // Par défaut proposée
                        }
                        needsUpdate = true;
                    }
                }
                if (needsUpdate) {
                    activityRepository.saveAll(existingActivities);
                    System.out.println("Activités existantes mises à jour avec les valeurs par défaut.");
                }
        
        if (activityRepository.count() == 0) {
            List<Activity> defaultActivities = Arrays.asList(
                createActivity(
                    "Tournoi de Basketball",
                    "Rejoignez-nous pour un tournoi de basketball amical entre étudiants ! Inscriptions ouvertes jusqu'au 20 novembre.\n\nLieu: Gymnase du CCNB - Campus de Bathurst\nDate: 25 novembre 2025\nHeure: 18h00\n\nPour plus d'informations, visitez: https://ccnb.ca",
                    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop"
                ),
                createActivity(
                    "Soirée Cinéma",
                    "Projection du film 'Les Intouchables' suivi d'une discussion. Popcorn et boissons offerts !\n\nLieu: Salle polyvalente - Campus de Bathurst\nDate: 28 novembre 2025\nHeure: 19h00\n\nRéservation: https://ccnb.ca/evenements",
                    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop"
                ),
                createActivity(
                    "Atelier de Cuisine Acadienne",
                    "Apprenez à préparer des plats traditionnels acadiens avec nos chefs locaux. Inscription limitée à 20 participants.\n\nLieu: Cuisine pédagogique - Campus de Bathurst\nDate: 30 novembre 2025\nHeure: 14h00\n\nCoût: 15$ par personne\n\nInscription: https://ccnb.ca/ateliers",
                    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop"
                ),
                createActivity(
                    "Conférence sur l'Entrepreneuriat",
                    "Conférence inspirante avec des entrepreneurs locaux qui partageront leurs expériences et conseils.\n\nInvités spéciaux:\n- Jessica Thibodeau (Jeska Communication)\n- Autres entrepreneurs de la région\n\nLieu: Auditorium - Campus de Bathurst\nDate: 5 décembre 2025\nHeure: 19h00\n\nPlus d'infos: https://ccnb.ca/conferences",
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop"
                ),
                createActivity(
                    "Journée Bénévolat Communautaire",
                    "Participez à notre journée de bénévolat pour aider la communauté locale. Plusieurs projets disponibles.\n\nProjets:\n- Nettoyage de parcs\n- Aide aux personnes âgées\n- Collecte de denrées alimentaires\n\nLieu: Divers lieux à Bathurst\nDate: 7 décembre 2025\nHeure: 9h00\n\nInscription: https://ccnb.ca/benevolat",
                    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop"
                ),
                createActivity(
                    "Soirée Jeux de Société",
                    "Venez passer une soirée conviviale autour de jeux de société. Jeux fournis, apportez vos amis !\n\nJeux disponibles:\n- Monopoly\n- Scrabble\n- Catan\n- Et bien d'autres !\n\nLieu: Salle commune - Campus de Bathurst\nDate: 12 décembre 2025\nHeure: 18h00\n\nGratuit et ouvert à tous !",
                    "https://images.unsplash.com/photo-1606166188511-27fb0c4e0f7a?w=800&h=600&fit=crop"
                ),
                createActivity(
                    "Atelier de Photographie",
                    "Apprenez les bases de la photographie avec un photographe professionnel. Apportez votre appareil photo ou smartphone.\n\nThèmes abordés:\n- Composition\n- Éclairage\n- Retouche photo\n\nLieu: Studio photo - Campus de Bathurst\nDate: 15 décembre 2025\nHeure: 14h00\n\nInscription: https://ccnb.ca/ateliers",
                    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop"
                ),
                createActivity(
                    "Fête de Noël de l'Association",
                    "Célébrez la fin de session avec une grande fête de Noël ! Musique, nourriture et ambiance festive garanties.\n\nAu programme:\n- Buffet de Noël\n- Musique live\n- Échange de cadeaux\n- Danse\n\nLieu: Grande salle - Campus de Bathurst\nDate: 20 décembre 2025\nHeure: 19h00\n\nBillets: 10$ (membres) / 15$ (non-membres)\n\nRéservation: https://ccnb.ca/fete-noel",
                    "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&h=600&fit=crop"
                )
            );

            activityRepository.saveAll(defaultActivities);
            System.out.println("Activités par défaut créées avec succès !");
        }
    }

            private Activity createActivity(String title, String description, String imageUrl) {
                Activity activity = new Activity();
                activity.setTitle(title);
                activity.setDescription(description);
                activity.setImageUrl(imageUrl);
                activity.setIsActive(true);
                activity.setIsFree(true); // Par défaut gratuit
                activity.setReservationRequired(false); // Par défaut pas de réservation
                activity.setIsPublished(false); // Par défaut proposée (en attente de vote)
                activity.setCreatedAt(LocalDateTime.now());
                return activity;
            }
}

