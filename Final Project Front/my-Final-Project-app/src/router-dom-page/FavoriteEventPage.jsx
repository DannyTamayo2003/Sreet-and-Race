/*
 * FavoriteEventPage.jsx — Pagina dei preferiti
 * Mostra la lista degli eventi salvati dall'utente come preferiti.
 * Richiede autenticazione: se l'utente non è loggato, mostra un messaggio di errore.
 */

import React, { useState, useEffect } from 'react'
import EventCardComponent from '../components/EventCardComponent'
import '../style/FavoriteEventPageStyle.css'

export default function FavoriteEventPage() {
  // Legge il token JWT salvato al momento del login
  const token = localStorage.getItem('token')

  const [favoriteEvents, setFavoriteEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(function() {
    // Se l'utente non è loggato, non fare la chiamata API
    if (!token) {
      setLoading(false)
      setError('Utente non autenticato. Accedi per vedere i tuoi preferiti.')
      return
    }

    setLoading(true)
    setError(null)

    // Recupera i preferiti dell'utente dal backend
    fetch(`${import.meta.env.VITE_API_URL}/api/user/eventsFavourites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(function(res) {
      if (!res.ok) {
        return res.json().then(function(errData) {
          throw new Error(errData.message || 'Errore nel recupero dei preferiti.')
        })
      }
      return res.json()
    })
    .then(function(data) {
      setFavoriteEvents(data)
      setLoading(false)
    })
    .catch(function(err) {
      setError(err.message || 'Si è verificato un errore durante il caricamento dei preferiti.')
      setLoading(false)
    })
  }, [token])

  // Rimuove un evento dai preferiti chiamando il backend e aggiornando la lista locale
  function removeFavorite(event) {
    if (!token) {
      alert('Non sei autenticato. Impossibile rimuovere dai preferiti.')
      return
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/user/eventi/${event._id}/preferiti`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(function(res) {
      if (res.ok) {
        // Rimuove l'evento dalla lista locale senza ricaricare la pagina
        setFavoriteEvents(function(prevEvents) {
          return prevEvents.filter(function(fav) { return fav._id !== event._id })
        })
        alert('Evento rimosso dai preferiti!')
      } else {
        return res.json().then(function(errData) {
          throw new Error(errData.message || 'Errore durante la rimozione.')
        })
      }
    })
    .catch(function(err) {
      alert('Errore: ' + err.message)
    })
  }

  return (
    <div className="favorite-events-container">
      <h2 className="favorite-title">I tuoi preferiti</h2>

      {loading && <p className="favorite-loading">Caricamento preferiti...</p>}
      {error && <p className="favorite-error">Errore: {error}</p>}

      {!loading && !error && favoriteEvents.length === 0 && (
        <p className="favorite-empty">Nessun evento nei preferiti.</p>
      )}

      <div className="favorite-cards-list">
        {!loading && !error && favoriteEvents.map(function(event) {
          return (
            <div key={event._id} className="favorite-card-wrapper">
              <EventCardComponent event={event} />
              <button
                className="remove-favorite-icon"
                onClick={function() { removeFavorite(event) }}
                aria-label="Rimuovi dai preferiti"
              >
                <ion-icon name="trash-outline"></ion-icon>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
