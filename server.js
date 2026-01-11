import express from 'express';
import neo4j from 'neo4j-driver';
import cors from 'cors';
import admin from 'firebase-admin';
import { createRequire } from 'module';

// Lecture du fichier de clé privée (nécessaire en mode ES Module)
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

// 1. CONFIGURATION FIREBASE
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());

// Connexion à Neo4j Desktop
const driver = neo4j.driver(
    'bolt://localhost:7687', 
    neo4j.auth.basic('neo4j', '12345678')
);

// RÉCUPÉRER UTILISATEURS AVEC STATUT
app.get('/api/admin/users', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (u:Utilisateur) 
            RETURN u, labels(u) as roles
        `);
        const users = result.records.map(record => {
            const props = record.get('u').properties;
            const roles = record.get('roles');
            return {
                id: props.id || 'N/A',
                nom: props.nom || props.name || 'Inconnu',
                email: props.email || 'N/A',
                metier: props.metier || '-',
                tarif: props.tarifHoraire || 0,
                suspendu: props.suspendu || false,
                role: roles.find(r => r !== 'Utilisateur') || 'Client'
            };
        });
        res.json(users);
    } finally { await session.close(); }
});

// STATISTIQUES GLOBAL
app.get('/api/admin/stats', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (u:Utilisateur)
            OPTIONAL MATCH (p:Prestataire)
            OPTIONAL MATCH (c:Client)
            RETURN count(u) as total, count(p) as pros, count(c) as clients
        `);
        const stats = result.records[0];
        res.json({
            total: stats.get('total').toNumber(),
            prestataires: stats.get('pros').toNumber(),
            clients: stats.get('clients').toNumber()
        });
    } finally { await session.close(); }
});

// ACTIONS DE MODÉRATION
app.patch('/api/admin/users/:id/toggle-status', async (req, res) => {
    const session = driver.session();
    try {
        await session.run('MATCH (u:Utilisateur {id: $id}) SET u.suspendu = NOT coalesce(u.suspendu, false)', { id: req.params.id });
        res.json({ success: true });
    } finally { await session.close(); }
});

app.put('/api/admin/users/:id/reset-password', async (req, res) => {
    const session = driver.session();
    try {
        await session.run("MATCH (u:Utilisateur {id: $id}) SET u.password = '123456'", { id: req.params.id });
        res.json({ success: true });
    } finally { await session.close(); }
});

app.delete('/api/admin/users/:id', async (req, res) => {
    const session = driver.session();
    try {
        await session.run('MATCH (u:Utilisateur {id: $id}) DETACH DELETE u', { id: req.params.id });
        res.json({ success: true });
    } finally { await session.close(); }
});

app.listen(3000, () => console.log('🚀 Serveur Admin KhedmaMa sur port 3000'));
// --- ROUTES ---

// 1. RÉCUPÉRER TOUS LES UTILISATEURS (Avec Rôles Custom)
app.get('/api/admin/users', async (req, res) => {
    try {
        // On récupère les 1000 derniers inscrits
        const listUsersResult = await admin.auth().listUsers(1000);
        
        const users = listUsersResult.users.map(userRecord => {
            return {
                id: userRecord.uid,
                // Affiche le nom, ou le début de l'email si pas de nom
                nom: userRecord.displayName || userRecord.email.split('@')[0], 
                email: userRecord.email,
                suspendu: userRecord.disabled, 
                // C'est ici qu'on lit l'étiquette "Rôle" (Custom Claim)
                role: userRecord.customClaims?.role || "Client" 
            };
        });

        res.json(users);
    } catch (error) {
        console.error("Erreur récupération users:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2. CHANGER LE RÔLE (NOUVELLE ROUTE IMPORTANTE)
app.patch('/api/admin/users/:id/role', async (req, res) => {
    const uid = req.params.id;
    const { role } = req.body; // On reçoit { role: 'Prestataire' } ou 'Client'

    try {
        // On écrit l'étiquette directement dans Firebase
        await admin.auth().setCustomUserClaims(uid, { role: role });

        console.log(`✅ Rôle mis à jour pour ${uid} : ${role}`);
        res.json({ success: true, role: role });
    } catch (error) {
        console.error("Erreur changement rôle:", error);
        res.status(500).json({ error: error.message });
    }
});

// 3. SUSPENDRE / BANNIR (Disable User)
app.patch('/api/admin/users/:id/toggle-status', async (req, res) => {
    const uid = req.params.id;
    try {
        const userRecord = await admin.auth().getUser(uid);
        const currentStatus = userRecord.disabled;
        const newStatus = !currentStatus;

        await admin.auth().updateUser(uid, { disabled: newStatus });

        console.log(`Utilisateur ${userRecord.email} -> ${newStatus ? 'Suspendu' : 'Activé'}`);
        res.json({ success: true, suspendu: newStatus });
    } catch (error) {
        console.error("Erreur Toggle:", error);
        res.status(500).json({ error: error.message });
    }
});

// 4. RÉINITIALISER LE MOT DE PASSE
app.put('/api/admin/users/:id/reset-password', async (req, res) => {
    const uid = req.params.id;
    try {
        const userRecord = await admin.auth().getUser(uid);
        const email = userRecord.email;

        if(email) {
            const link = await admin.auth().generatePasswordResetLink(email);
            console.log("Lien généré pour", email, ":", link);
            res.json({ success: true, message: "Lien généré dans la console serveur", link });
        } else {
            res.status(404).json({ error: "Email non trouvé" });
        }
    } catch (error) {
        console.error("Erreur Reset:", error);
        res.status(500).json({ error: error.message });
    }
});

// 5. SUPPRIMER UN UTILISATEUR
app.delete('/api/admin/users/:id', async (req, res) => {
    const uid = req.params.id;
    try {
        await admin.auth().deleteUser(uid);
        console.log(`🗑️ Firebase: User ${uid} supprimé`);
        res.json({ success: true });
    } catch (error) {
        console.error("Erreur Delete:", error);
        res.status(500).json({ error: error.message });
    }
});

// 6. STATISTIQUES (Basique)
app.get('/api/admin/stats', async (req, res) => {
    // Note : Le calcul précis se fait maintenant côté Frontend (App.jsx)
    // Cette route sert juste de backup si besoin
    try {
        const listUsersResult = await admin.auth().listUsers(1000);
        res.json({ total: listUsersResult.users.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('🚀 Serveur Admin (100% Firebase + Rôles) sur port 3000'));
