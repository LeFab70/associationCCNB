-- Script SQL URGENT pour corriger les URLs d'images
-- Les URLs contiennent "/public_html/aeccb" deux fois, ce qui les rend inaccessibles
-- Exécutez ce script IMMÉDIATEMENT dans PostgreSQL

-- CORRECTION DES ACTIVITÉS
UPDATE activities 
SET image_url = REPLACE(image_url, '/public_html/aeccb', '')
WHERE image_url LIKE '%/public_html/aeccb%';

-- CORRECTION DES PROPOSITIONS
UPDATE proposals 
SET photo_url = REPLACE(photo_url, '/public_html/aeccb', '')
WHERE photo_url LIKE '%/public_html/aeccb%';

-- CORRECTION DES PHOTOS D'ACTIVITÉS
UPDATE activity_photos 
SET photo_url = REPLACE(photo_url, '/public_html/aeccb', '')
WHERE photo_url LIKE '%/public_html/aeccb%';

-- CORRECTION DES AVIS
UPDATE reviews 
SET photo_url = REPLACE(photo_url, '/public_html/aeccb', '')
WHERE photo_url LIKE '%/public_html/aeccb%';

-- VÉRIFICATION
SELECT 'Activités corrigées' as type, COUNT(*) as count
FROM activities 
WHERE image_url LIKE '%/public_html/aeccb%'
UNION ALL
SELECT 'Propositions corrigées', COUNT(*)
FROM proposals 
WHERE photo_url LIKE '%/public_html/aeccb%'
UNION ALL
SELECT 'Photos activités corrigées', COUNT(*)
FROM activity_photos 
WHERE photo_url LIKE '%/public_html/aeccb%'
UNION ALL
SELECT 'Avis corrigés', COUNT(*)
FROM reviews 
WHERE photo_url LIKE '%/public_html/aeccb%';

-- Si le résultat est 0 pour tous, les URLs sont corrigées !

-- Afficher quelques exemples d'URLs corrigées
SELECT 'Exemples URLs activités' as type, id, title, image_url 
FROM activities 
WHERE image_url IS NOT NULL 
LIMIT 3;

