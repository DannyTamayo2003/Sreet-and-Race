/*
 * FavoriteButtonComponent.jsx — Pulsante preferiti
 * Al mount verifica dal backend se l'evento è già nei preferiti.
 * Al click fa il toggle: aggiunge (PUT) o rimuove (DELETE).
 */

import React, { useState, useEffect } from 'react'
import '../style/FavoriteButtonStyle.css'

export default function FavoriteButtonComponent({ event, onRemove, favoriteIds }) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(function() {
    // Se il componente padre ha già caricato i preferiti, usa quelli (evita N fetch identiche)
    if (favoriteIds !== undefined) {
      if (favoriteIds !== null) {
        setIsFavorited(favoriteIds.has(event._id))
      }
      return
    }

    // Nessun favoriteIds passato (es. EventDetailPage): fetch individuale
    const token = localStorage.getItem('token')
    if (!token || !event._id) return

    fetch(`${import.meta.env.VITE_API_URL}/api/user/eventsFavourites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(function(res) {
      if (!res.ok) return null
      return res.json()
    })
    .then(function(data) {
      if (!data) return
      const found = data.some(function(ev) { return ev._id === event._id })
      setIsFavorited(found)
    })
    .catch(function() {})
  }, [event._id, favoriteIds])

  function handleToggleFavorite() {
    const token = localStorage.getItem('token')

    if (!token) {
      alert('Devi essere loggato per aggiungere un evento ai preferiti.')
      return
    }

    if (!event._id) return

    setIsLoading(true)

    const method = isFavorited ? 'DELETE' : 'PUT'

    fetch(`${import.meta.env.VITE_API_URL}/api/user/eventi/${event._id}/preferiti`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(function(res) {
      return res.json().then(function(data) {
        if (res.status === 401) {
          localStorage.removeItem('token')
          alert('Sessione scaduta. Effettua di nuovo il login.')
          return
        }
        if (res.ok) {
          setIsFavorited(!isFavorited)
          if (isFavorited && onRemove) onRemove(event._id)
        } else {
          alert(data.message || 'Errore. Riprova più tardi.')
        }
      })
    })
    .catch(function() {
      alert('Errore di rete. Riprova più tardi.')
    })
    .finally(function() {
      setIsLoading(false)
    })
  }

  return (
    <button
      className="fav-btn"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      aria-label={isFavorited ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
    >
      <span className={`fav-icon-wrapper${isFavorited ? ' fav-icon-wrapper--active' : ''}`}>
        <ion-icon name={isFavorited ? 'heart' : 'heart-outline'} class="fav-icon"></ion-icon>
      </span>
    </button>
  )
}
