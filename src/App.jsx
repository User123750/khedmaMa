import React, { useEffect, useState } from 'react';
import './App.css'; 

function App() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, prestataires: 0, clients: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Solution radicale : fetchData est DANS le useEffect
  useEffect(() => {
    const loadData = async () => {
      try {
        const [uRes, sRes] = await Promise.all([
          fetch('http://localhost:3000/api/admin/users'),
          fetch('http://localhost:3000/api/admin/stats')
        ]);
        
        if (uRes.ok && sRes.ok) {
          setUsers(await uRes.json());
          setStats(await sRes.json());
        }
      } catch (err) {
        console.error("Erreur de connexion :", err);
      }
    };

    loadData();
  }, []); // Tableau vide = exécution unique. Plus de ligne rouge possible ici.

  // --- ACTIONS DE MODÉRATION ---

  const deleteUser = async (id) => {
    if (window.confirm("🗑️ Supprimer ce compte de Neo4j ?")) {
      const res = await fetch(`http://localhost:3000/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) window.location.reload(); // Rechargement simple pour mettre à jour
    }
  };

  const toggleStatus = async (id) => {
    const res = await fetch(`http://localhost:3000/api/admin/users/${id}/toggle-status`, { method: 'PATCH' });
    if (res.ok) window.location.reload();
  };

  const resetPass = async (id) => {
    if (window.confirm("🔑 Réinitialiser le mot de passe ?")) {
      await fetch(`http://localhost:3000/api/admin/users/${id}/reset-password`, { method: 'PUT' });
      alert("Succès !");
    }
  };

  const filteredUsers = users.filter(user => 
    (user.nom || user.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">🛠️ Administration KhedmaMa</h1>
      </header>

      <section className="stats-section">
        <div className="stats-card">
          <div className="stats-icon">👥</div>
          <div className="stats-content">
            <div className="stats-label">Total</div>
            <div className="stats-value">{stats.total}</div>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon">🔧</div>
          <div className="stats-content">
            <div className="stats-label">Pros</div>
            <div className="stats-value">{stats.prestataires}</div>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon">👨‍💼</div>
          <div className="stats-content">
            <div className="stats-label">Clients</div>
            <div className="stats-value">{stats.clients}</div>
          </div>
        </div>
      </section>

      <section className="filters-section">
        <div className="search-box">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Rechercher..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </section>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>UTILISATEUR</th>
              <th style={{ width: '20%' }}>EMAIL</th>
              <th style={{ width: '15%' }}>RÔLE</th>
              <th style={{ width: '15%' }}>EXPERTISE</th>
              <th style={{ width: '20%' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className={`user-row ${user.suspendu ? 'suspendu' : ''}`}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">{(user.nom || user.name || "U").charAt(0)}</div>
                    <div className="user-details">
                      <div className="user-name">{user.nom || user.name}</div>
                      <div className="user-id">ID: {user.id?.substring(0, 8)}</div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td><span className={`role-badge ${(user.role || "").toLowerCase()}`}>{user.role}</span></td>
                <td>{user.role === 'Prestataire' ? <span className="metier-tag">💼 {user.metier}</span> : '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-delete" onClick={() => deleteUser(user.id)}>🗑️</button>
                    <button className="btn-action" onClick={() => toggleStatus(user.id)} style={{background: user.suspendu ? '#10b981' : '#f59e0b', color: 'white', border: 'none', padding: '8px', borderRadius: '6px'}}>
                      {user.suspendu ? '🔓' : '🚫'}
                    </button>
                    <button className="btn-action" onClick={() => resetPass(user.id)} style={{background: '#6366f1', color: 'white', border: 'none', padding: '8px', borderRadius: '6px'}}>🔑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;