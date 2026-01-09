// src/services/neo4jService.js
import neo4j from 'neo4j-driver';

// Assure-toi que c'est bien ton IP locale ici
const NEO4J_URL = 'bolt://192.168.11.104:7687';
const NEO4J_USER = 'neo4j';
const NEO4J_PASSWORD = '12345678';

// On ajoute un 3ème argument : l'objet de configuration
const driver = neo4j.driver(
    NEO4J_URL,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
    { 
        encrypted: false // 👈 C'EST LA CLÉ ! (Désactive SSL pour le local)
    }
);

export const runCypher = async (query, params = {}) => {
    const session = driver.session();
    try {
        const result = await session.run(query, params);
        // On retourne juste les records pour simplifier
        return result.records;
    } catch (error) {
        console.error("Erreur Cypher:", error);
        throw error;
    } finally {
        await session.close();
    }
};

export default driver;