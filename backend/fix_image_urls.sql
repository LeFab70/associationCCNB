-- Script SQL pour corriger les URLs d'images dans la base de données
-- Exécutez ce script dans PostgreSQL pour corriger les URLs qui contiennent "public_html/aeccb" deux fois

-- 1. Vérifier les URLs actuelles
SELECT 'Activités' as table_name, id, title, image_url 
FROM activities 
WHERE image_url IS NOT NULL 
LIMIT 5;

SELECT 'Propositions' as table_name, id, name, photo_url 
FROM proposals 
WHERE photo_url IS NOT NULL 
LIMIT 5;

SELECT 'Photos d\'activités' as table_name, id, photo_url 
FROM activity_photos 
WHERE photo_url IS NOT NULL 
LIMIT 5;

SELECT 'Avis' as table_name, id, name, photo_url 
FROM reviews 
WHERE photo_url IS NOT NULL 
LIMIT 5;

-- 2. Corriger les URLs des activités (supprimer /public_html/aeccb si présent)
UPDATE activities 
SET image_url = REPLACE(image_url, '/public_html/aeccb', '')
WHERE image_url LIKE '%/public_html/aeccb%';

-- 3. Corriger les URLs des propositions
UPDATE proposals 
SET photo_url = REPLACE(photo_url, '/public_html/aeccb', '')
WHERE photo_url LIKE '%/public_html/aeccb%';

-- 4. Corriger les URLs des photos d'activités
UPDATE activity_photos 
SET photo_url = REPLACE(photo_url, '/public_html/aeccb', '')
WHERE photo_url LIKE '%/public_html/aeccb%';

-- 5. Corriger les URLs des avis
UPDATE reviews 
SET photo_url = REPLACE(photo_url, '/public_html/aeccb', '')
WHERE photo_url LIKE '%/public_html/aeccb%';

-- 6. Vérifier les URLs après correction
SELECT 'Activités (après correction)' as table_name, id, title, image_url 
FROM activities 
WHERE image_url IS NOT NULL 
LIMIT 5;

SELECT 'Propositions (après correction)' as table_name, id, name, photo_url 
FROM proposals 
WHERE photo_url IS NOT NULL 
LIMIT 5;

-- 7. Vérifier que toutes les URLs commencent par http:// ou https://
SELECT 'URLs sans http/https' as check_type, COUNT(*) as count
FROM (
    SELECT image_url as url FROM activities WHERE image_url IS NOT NULL
    UNION ALL
    SELECT photo_url as url FROM proposals WHERE photo_url IS NOT NULL
    UNION ALL
    SELECT photo_url as url FROM activity_photos WHERE photo_url IS NOT NULL
    UNION ALL
    SELECT photo_url as url FROM reviews WHERE photo_url IS NOT NULL
) all_urls
WHERE url NOT LIKE 'http://%' AND url NOT LIKE 'https://%';

