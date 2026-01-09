const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Pour lire le JSON envoyé par le téléphone

// --- CONFIGURATION NEO4J ---
// (Mets tes infos ici ou dans un fichier .env plus tard)
const driver = neo4j.driver(
    'neo4j://localhost:7687', // Ou ton IP locale si besoin
    neo4j.auth.basic('neo4j', 'TON_MOT_DE_PASSE')
);

// --- ROUTE D'INSCRIPTION ---
app.post('/api/register', async (req, res) => {
    const { uid, email, role, nom, metier, telephone } = req.body;
    const session = driver.session();

    try {
        // La requête Cypher que tu avais dans le téléphone
        const result = await session.run(
            `
            CREATE (u:User {id: $uid, email: $email, role: $role, nom: $nom, telephone: $telephone})
            WITH u
            CALL {
                WITH u
                MATCH (r:Role {name: $role})
                MERGE (u)-[:A_ROLE]->(r)
            }
            // Si c'est un prestataire, on ajoute le métier
            FOREACH (_ IN CASE WHEN $role = 'Prestataire' THEN [1] ELSE [] END |
                SET u.metier = $metier
            )
            RETURN u
            `,
            { uid, email, role, nom, metier, telephone }
        );

        res.status(201).json({ message: 'Utilisateur créé', user: result.records[0].get('u').properties });
    } catch (error) {
        console.error('Erreur Neo4j:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
});

// Lancer le serveur
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Backend tourne sur le port ${PORT}`);
});