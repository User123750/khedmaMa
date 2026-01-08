// backend-khedma/routes/admin.js
const express = require('express');
const router = express.Router();
const neo4j = require('neo4j-driver');
require('dotenv').config();

// Connexion à Neo4j
const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || '12345678'), 
    { encrypted: 'ENCRYPTION_OFF' }
);

// --- C'EST CETTE ROUTE QUI MANQUAIT ---
router.get('/dashboard-stats', async (req, res) => {
    const session = driver.session();
    try {
        const query = `
            MATCH (c:User {role: 'Client'})
            MATCH (p:User {role: 'Prestataire'})
            RETURN count(c) as totalClients, count(p) as totalPros
        `;
        
        const result = await session.run(query);
        
        let clients = 0;
        let pros = 0;

        if (result.records.length > 0) {
            clients = result.records[0].get('totalClients').low;
            pros = result.records[0].get('totalPros').low;
        }

        res.json({
            clients: clients,
            pros: pros,
            revenuTotal: 15400,
            paiementsEnAttente: 3
        });
    } catch (error) {
        console.error("Erreur Admin:", error);
        res.json({ clients: 0, pros: 0, revenuTotal: 0 });
    } finally {
        await session.close();
    }
});

module.exports = router;