import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

/* --- DÉFINITION DES ICÔNES (Placées ici pour être accessibles partout) --- */
const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconBriefcase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const IconMoney = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="2" y2="22"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

/* --- COMPOSANT PRINCIPAL --- */
function App() {
  const [stats, setStats] = useState({ clients: 0, pros: 0, revenuTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Appel au backend
    axios.get('http://localhost:3000/api/admin/dashboard-stats')
      .then(response => {
        setStats(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur API:", err);
        setError("Impossible de joindre le serveur. Vérifie que le backend tourne sur le port 3000.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="app-container">
      {/* --- NAVBAR --- */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <div className="logo-container">
              {/* Logo Khedma */}
              <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
              </svg>
              <span className="logo-text">Khedma<span className="logo-highlight">.ma</span></span>
            </div>
            <span className="admin-badge">ADMIN</span>
          </div>
          
          <div className="navbar-actions">
            <button className="logout-btn">
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="main-content">
        <header className="dashboard-header">
          <h2>Vue d'ensemble</h2>
          <p className="dashboard-subtitle">Bienvenue sur votre tableau de bord de gestion.</p>
        </header>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des données...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">!</div>
            <h3>Erreur de Connexion</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>Réessayer</button>
          </div>
        ) : (
          <div className="stats-grid">
            
            {/* CARTE CLIENTS */}
            <div className="stat-card clients-card">
              <div className="card-icon-container clients-icon">
                <IconUsers />
              </div>
              <div className="card-content">
                <h3 className="card-title">Clients Inscrits</h3>
                <div className="card-number">{stats.clients}</div>
                <div className="card-trend trend-up">Utilisateurs actifs</div>
              </div>
              <div className="card-decoration"></div>
            </div>

            {/* CARTE PRESTATAIRES */}
            <div className="stat-card pros-card">
              <div className="card-icon-container pros-icon">
                <IconBriefcase />
              </div>
              <div className="card-content">
                <h3 className="card-title">Prestataires</h3>
                <div className="card-number">{stats.pros}</div>
                <div className="card-trend trend-up">Professionnels vérifiés</div>
              </div>
              <div className="card-decoration"></div>
            </div>

            {/* CARTE REVENUS */}
            <div className="stat-card revenue-card">
              <div className="card-icon-container revenue-icon">
                <IconMoney />
              </div>
              <div className="card-content">
                <h3 className="card-title">Chiffre d'Affaires</h3>
                <div className="card-number">
                  {stats.revenuTotal.toLocaleString()} <span className="currency">DH</span>
                </div>
                <div className="card-trend">Revenu global</div>
              </div>
              <div className="card-decoration"></div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;