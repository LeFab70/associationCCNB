-- Script SQL pour ajouter la colonne is_approved à la table activity_photo_comments
-- Exécutez ce script dans votre base de données PostgreSQL

-- Vérifier si la colonne existe déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'activity_photo_comments' 
        AND column_name = 'is_approved'
    ) THEN
        -- Ajouter la colonne is_approved
        ALTER TABLE activity_photo_comments 
        ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;
        
        -- Mettre à jour les valeurs existantes pour s'assurer qu'elles sont à false
        UPDATE activity_photo_comments 
        SET is_approved = false 
        WHERE is_approved IS NULL;
        
        RAISE NOTICE 'Colonne is_approved ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne is_approved existe déjà';
    END IF;
END $$;

