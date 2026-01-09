import express from 'express';
import neo4j from 'neo4j-driver';
import cors from 'cors';

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