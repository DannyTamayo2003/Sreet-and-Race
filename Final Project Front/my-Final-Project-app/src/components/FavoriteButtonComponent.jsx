/*
 * FavoriteButtonComponent.jsx — Pulsante "Aggiungi ai preferiti"
 * Invia una richiesta PUT al backend per aggiungere l'evento ai preferiti dell'utente.
 * Richiede che l'utente sia loggato (token in localStorage).
 */

import React from 'react'
import '../style/FavoriteButtonStyle.css'

export default function FavoriteButtonComponent({ event }) {

  function handleAddFavorite() {
    const token = localStorage.getItem('token')

    // Controlla se l'utente è loggato
    if (!token) {
      alert('Devi essere loggato per aggiungere un evento ai preferiti.')
      return
    }

    // Controlla che l'evento abbia un ID valido (tutti gli eventi dal DB ce l'hanno)
    if (!event._id) {
      alert('Impossibile aggiungere questo evento ai preferiti.')
      return
    }

    // Invia la richiesta al backend per aggiungere l'evento ai preferiti
    fetch(`http://localhost:3000/api/user/eventi/${event._id}/preferiti`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Il token JWT viene inviato nell'header Authorization per autenticare la richiesta
        'Authorization': `Bearer ${token}`
      }
    })
    .then(function(res) {
      return res.json().then(function(data) {
        if (res.ok) {
          alert('Evento aggiunto ai preferiti!')
        } else {
          alert(data.message || 'Errore durante l\'aggiunta ai preferiti.')
        }
      })
    })
    .catch(function() {
      alert('Errore di rete. Riprova più tardi.')
    })
  }

  return (
    <button className="favoriteButton" onClick={handleAddFavorite}>
      <span className="favoriteButtonText" role="img" aria-label="heart">
        aggiungi ai tuoi preferiti ❤️
      </span>
    </button>
  )
}
