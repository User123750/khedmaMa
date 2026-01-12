const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION NEO4J ---
const driver = neo4j.driver(
    'neo4j://localhost:7687', 
    neo4j.auth.basic('neo4j', '12345678')
);

// --- 1. ROUTE INSCRIPTION ---
app.post('/api/register', async (req, res) => {
    const { uid, email, role, nom, metier, telephone } = req.body;
    const session = driver.session();
    try {
        const result = await session.run(
            `CREATE (u:Utilisateur {id: $uid, email: $email, role: $role, nom: $nom, telephone: $telephone})
             WITH u
             CALL { WITH u MATCH (r:Role {name: $role}) MERGE (u)-[:A_ROLE]->(r) }
             FOREACH (_ IN CASE WHEN $role = 'Prestataire' THEN [1] ELSE [] END | 
                SET u:Prestataire, u.metier = $metier
             )
             RETURN u`,
            { uid, email, role, nom, metier, telephone }
        );
        res.status(201).json({ message: 'Utilisateur créé', user: result.records[0].get('u').properties });
    } catch (error) {
        console.error("Erreur Register:", error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

// --- 2. ROUTE RECOMMANDATION (TOP POPULARITÉ ABSOLUE) ---
app.get('/api/recommendations/:uid', async (req, res) => {
    const { uid } = req.params;
    const session = driver.session();

    try {
        const query = `
            MATCH (me:Utilisateur {id: $uid})
            
            // 1. Trouver TOUS les prestataires (sauf moi-même)
            // J'ai enlevé le filtre "NOT (me)-[:RESERVE]->(p)" pour inclure ceux que tu connais déjà
            MATCH (p:Prestataire)
            WHERE p.id <> $uid 
            
            // 2. Compter leurs réservations TOTALES
            OPTIONAL MATCH (p)<-[r:RESERVE]-()
            WITH p, count(r) as score
            
            // 3. Retourner les infos
            RETURN p.id as id, 
                   p.nom as nom, 
                   p.metier as metier, 
                   p.photo as photo,
                   score
            
            // 4. TRIER : Le plus gros score en tout premier
            ORDER BY score DESC
            LIMIT 5
        `;

        const result = await session.run(query, { uid });
        const recommendations = result.records.map(record => ({
            id: record.get('id'),
            nom: record.get('nom'),
            metier: record.get('metier'),
            photo: record.get('photo'),
            score: record.get('score').toNumber()
        }));

        res.json(recommendations);

    } catch (error) {
        console.error('Erreur Recommendation:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

// --- 3. ROUTE RÉSERVATION ---
app.post('/api/book', async (req, res) => {
    const { clientId, proId, date, description } = req.body;
    const session = driver.session();

    try {
        if (!clientId || !proId || !date || !description) {
            return res.status(400).json({ error: "Données manquantes" });
        }

        const query = `
            MATCH (c:Utilisateur {id: $clientId})
            MATCH (p:Utilisateur {id: $proId})
            CREATE (c)-[r:RESERVE {
                id: randomUUID(), 
                datePrevue: $date,
                description: $description,
                status: 'EN_ATTENTE',
                dateCreation: datetime()
            }]->(p)
            RETURN r
        `;

        await session.run(query, { clientId, proId, date, description });
        res.status(201).json({ success: true, message: 'Réservation créée' });
    } catch (error) {
        console.error("Erreur Booking:", error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

// --- 4. LISTE DES PRESTATAIRES (Par métier + Popularité) ---
app.get('/api/providers/:metier', async (req, res) => {
    const { metier } = req.params;
    const session = driver.session();
    try {
        const query = `
            MATCH (p:Prestataire)
            WHERE p.metier = $metier
            
            OPTIONAL MATCH (p)<-[r:RESERVE]-()
            WITH p, count(r) as popularity
            
            RETURN p.id as id, 
                   p.nom as nom, 
                   p.metier as metier, 
                   p.tarifHoraire as tarif, 
                   p.photo as photo, 
                   popularity
            ORDER BY popularity DESC
        `;
        
        console.log(`Recherche pour le métier : ${metier}`);
        const result = await session.run(query, { metier });
        console.log(`Résultats trouvés : ${result.records.length}`);

        const providers = result.records.map(record => ({
            id: record.get('id'),
            nom: record.get('nom'),
            metier: record.get('metier'),
            tarifHoraire: record.get('tarif'),
            photo: record.get('photo'),
            popularity: record.get('popularity').toNumber()
        }));

        res.json(providers);
    } catch (error) {
        console.error('Erreur Providers:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Backend tourne sur le port ${PORT}`);
});