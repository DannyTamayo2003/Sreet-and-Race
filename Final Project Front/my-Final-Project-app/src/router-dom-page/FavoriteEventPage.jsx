import React, { useState, useEffect } from 'react'
import EventCardComponent from '../components/EventCardComponent'
import '../style/FavoriteEventPageStyle.css'

export default function FavoriteEventPage() {
  const userId = localStorage.getItem('userId');
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  // ASSICURATI CHE QUESTE DUE RIGHE SIANO PRESENTI:
  const [loading, setLoading] = useState(true); // Stato per gestire il caricamento
  const [error, setError] = useState(null);   // Stato per gestire gli errori

  useEffect(() => {
    // Se l'utente non è loggato, non fare la chiamata API
    if (!userId) {
      setLoading(false);
      setError('Utente non autenticato. Accedi per vedere i tuoi preferiti.');
      return;
    }
    setLoading(true);
    setError(null); // Resetta eventuali errori precedenti
    // Chiamata API per ottenere gli eventi preferiti dell'utente
    fetch(`http://localhost:3000/api/user/eventsFavourites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`
      },
    })
      .then(res => {
        if (!res.ok) {
          // Se la risposta non è OK (es. 401, 404, 500), lancia un errore
          return res.json().then(errData => {
            throw new Error(errData.message || 'Errore nel recupero dei preferiti.');
          });
        }
        return res.json();
      })
      .then(data => {
        // La tua API restituisce direttamente un array di eventi preferiti
        setFavoriteEvents(data);
        console.log('Preferiti:', data); // <--- AGGIUNGI QUESTA RIGA
        setLoading(false);
      })
      .catch(err => {
        console.error('Errore nel caricamento dei preferiti:', err);
        setError(err.message || 'Si è verificato un errore durante il caricamento dei preferiti.');
        setLoading(false);
      });
  }, [userId]); // Ricarica i preferiti quando cambia l'ID utente

    const removeFavorite = (event) => {
    if (!userId) {
      alert('Non sei autenticato. Impossibile rimuovere dai preferiti.');
      return;
    }

    // Se manca l'_id, rimuovi solo dalla UI
    if (!event._id) {
      setFavoriteEvents(prevEvents => prevEvents.filter(fav => fav !== event));
      alert('Evento rimosso solo dalla lista locale (mancava l\'ID).');
      return;
    }

    fetch(`http://localhost:3000/api/user/eventi/${event._id}/preferiti`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`
      },
    })
      .then(res => {
        if (res.ok || res.status === 404) { // accetta anche 404 come successo
          alert('Evento rimosso dai preferiti!');
          setFavoriteEvents(prevEvents => prevEvents.filter(fav => fav._id !== event._id));
        } else {
          return res.json().then(errData => {
            throw new Error(errData.message || 'Errore durante la rimozione dai preferiti.');
          });
        }
      })
      .catch(err => {
        console.error('Errore nella rimozione del preferito:', err);
        alert(`Errore nella rimozione: ${err.message}`);
      });
  };

  return (
    <div className="favorite-events-container">
      <h2 className="favorite-title">I tuoi preferiti</h2>

      {loading && <p className="favorite-loading">Caricamento preferiti...</p>}
      {error && <p className="favorite-error">Errore: {error}</p>}

      {!loading && !error && favoriteEvents.length === 0 && (
        <p className="favorite-empty">Nessun evento nei preferiti.</p>
      )}

      <div className="favorite-cards-list">
        {!loading && !error && favoriteEvents.map(event => (
          <div key={event._id} className="favorite-card-wrapper">
            <EventCardComponent event={event} />
            <button
              className="remove-favorite-icon"
              onClick={() => removeFavorite(event)}
              aria-label="Rimuovi dai preferiti"
            >
              <ion-icon name="trash-outline"></ion-icon>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}