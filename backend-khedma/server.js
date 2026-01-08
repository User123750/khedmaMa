const express = require('express');
const cors = require('cors'); // Pour que le site Admin puisse parler au serveur
const neo4j = require('neo4j-driver');
require('dotenv').config();

// --- IMPORT UNIQUEMENT DE L'ADMIN ---
// (On a retiré l'auth pour ne pas avoir d'erreur)
const adminRoutes = require('./routes/admin'); 

const app = express();

app.use(cors()); // Autorise le site Web
app.use(express.json()); 

// --- CONNEXION NEO4J ---
const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || '12345678'), // <--- Vérifie ton mot de passe ici (souvent 12345678 ou khedma123)
    { encrypted: 'ENCRYPTION_OFF' }
);
// --- GESTION DES MESSAGES ET NOTIFICATIONS ---

// 1. Route pour ENVOYER un message (et créer la notif)
app.post('/api/messages/send', async (req, res) => {
    const { senderId, receiverId, content } = req.body;
    const session = driver.session();

    try {
        // Cette requête fait 2 choses : Crée le Message + Crée la Notification
        const result = await session.run(
            `
            MATCH (sender:User {id: $senderId})
            MATCH (receiver:User {id: $receiverId})
            
            // 1. Créer le Message
            CREATE (m:Message {
                id: randomUUID(),
                content: $content, 
                createdAt: datetime()
            })
            CREATE (sender)-[:SENT]->(m)-[:TO]->(receiver)

            // 2. Créer la Notification pour le destinataire
            CREATE (n:Notification {
                id: randomUUID(),
                type: 'MESSAGE',
                text: 'Nouveau message de ' + sender.name,
                read: false, 
                createdAt: datetime()
            })
            CREATE (n)-[:BELONGS_TO]->(receiver)
            
            RETURN m, n
            `,
            { senderId, receiverId, content }
        );

        res.json({ success: true, message: "Message envoyé et notif créée !" });
    } catch (error) {
        console.error("Erreur envoi message:", error);
        res.status(500).json({ error: "Erreur serveur" });
    } finally {
        await session.close();
    }
});

// 2. Route pour que le Freelancer VOIE ses notifications
app.get('/api/notifications/:userId', async (req, res) => {
    const { userId } = req.params;
    const session = driver.session();

    try {
        // On récupère toutes les notifs du user, triées par date
        const result = await session.run(
            `
            MATCH (n:Notification)-[:BELONGS_TO]->(u:User {id: $userId})
            RETURN n.text as text, n.read as read, n.createdAt as date
            ORDER BY n.createdAt DESC
            `,
            { userId }
        );

        const notifications = result.records.map(record => ({
            text: record.get('text'),
            read: record.get('read'),
            date: record.get('date')
        }));

        res.json(notifications);
    } catch (error) {
        console.error("Erreur récupération notifs:", error);
        res.status(500).json({ error: "Erreur serveur" });
    } finally {
        await session.close();
    }
});
// --- ROUTE ADMIN ---
// C'est la seule route active maintenant
app.use('/api/admin', adminRoutes);

// --- DÉMARRAGE ---
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Serveur Backend (Mode Admin) tourne sur http://localhost:${PORT}`);
});