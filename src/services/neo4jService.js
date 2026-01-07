// src/services/neo4jService.js

// Si tu utilises Neo4j Aura (Cloud), l'URL ressemble à ça (port 7473 pour HTTPS, ou 7474 pour HTTP local)
// Remplace par tes infos Neo4j
const NEO4J_URL = 'http://192.168.11.104:7474/db/neo4j/tx/commit';
const NEO4J_USER = 'neo4j';
const NEO4J_PASSWORD = '12345678';

// Fonction générique pour exécuter une requête Cypher
export const runCypher = async (cypherQuery, params = {}) => {
  try {
    const response = await fetch(NEO4J_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;charset=UTF-8',
        'Content-Type': 'application/json',
        // Authentification Basic (encodage base64)
        'Authorization': 'Basic ' + btoa(`${NEO4J_USER}:${NEO4J_PASSWORD}`) 
      },
      body: JSON.stringify({
        statements: [
          {
            statement: cypherQuery,
            parameters: params
          }
        ]
      })
    });

    const json = await response.json();
    
    if (json.errors && json.errors.length > 0) {
      console.error("Erreur Neo4j:", json.errors);
      throw new Error(json.errors[0].message);
    }

    return json.results[0].data; // Retourne les données brutes
  } catch (error) {
    console.error("Erreur connexion Neo4j:", error);
    throw error;
  }
};