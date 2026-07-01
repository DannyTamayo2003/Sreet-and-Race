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


  return (
    <div className="favorite-events-container">
      {loading && <p className="favorite-loading">Caricamento preferiti...</p>}
      {error && <p className="favorite-error">Errore: {error}</p>}

      {!loading && !error && favoriteEvents.length === 0 && (
        <p className="favorite-empty">Nessun evento nei preferiti.</p>
      )}

      <div className="favorite-grid">
        {!loading && !error && (function() {
          // Tutti gli eventi mostrati qui sono preferiti: passiamo il Set così
          // FavoriteButtonComponent non fa fetch individuali inutili
          const favoriteIds = new Set(favoriteEvents.map(function(ev) { return ev._id }))
          return favoriteEvents.map(function(event) {
            return (
              <EventCardComponent
                key={event._id}
                event={event}
                favoriteIds={favoriteIds}
                variant="horizontal"
                onRemove={function(id) {
                  setFavoriteEvents(function(prev) {
                    return prev.filter(function(ev) { return ev._id !== id })
                  })
                }}
              />
            )
          })
        })()}
      </div>
    </div>
  )
}
