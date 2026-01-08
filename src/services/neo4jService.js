// src/services/neo4jService.js

// Si tu utilises Neo4j Aura (Cloud), l'URL ressemble à ça (port 7473 pour HTTPS, ou 7474 pour HTTP local)
// Remplace par tes infos Neo4j

// src/services/neo4jService.js
import neo4j from 'neo4j-driver';

// ⚠️ Assure-toi que c'est bien ton IP locale ici
const NEO4J_URL = 'bolt://192.168.11.104:7687';
const NEO4J_USER = 'neo4j';
const NEO4J_PASSWORD = '12345678'; 

const driver = neo4j.driver(
    NEO4J_URL, 
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

// 👇 C'EST CETTE PARTIE QUI MANQUE SÛREMENT 👇
export const runCypher = async (query, params = {}) => {
    const session = driver.session();
    try {
        const result = await session.run(query, params);
        return result.records;
    } catch (error) {
        console.error("Erreur Cypher:", error);
        throw error;
    } finally {
        await session.close();
    }
};

export default driver;;