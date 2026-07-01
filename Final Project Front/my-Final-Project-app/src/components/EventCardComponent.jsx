/*
 * EventCardComponent.jsx — Card singolo evento
 * Mostra immagine, nome e città di un evento.
 * Il click su "Dettagli" passa l'intero oggetto evento alla pagina di dettaglio
 * tramite router state, evitando una fetch aggiuntiva.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import FavoriteButtonComponent from './FavoriteButtonComponent'
import DetailButtonComponent from './DetailButtonComponent'
import '../style/DetailButtonStyle.css'
import '../style/EventCardStyle.css'

export default function EventCardComponent({ event, onRemove, favoriteIds, variant = 'vertical' }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    const day = d.getDate().toString().padStart(2, '0')
    const month = d.toLocaleString('it-IT', { month: 'short' }).toUpperCase()
    return { day, month }
  }

  const date = formatDate(event.data)

  return (
    <div className={`ec-card${variant === 'horizontal' ? ' ec-card--horizontal' : ''}`}>

      {/* Immagine con badge data e preferito */}
      <div className="ec-image-wrapper">
        <img
          src={event.image || 'https://placehold.co/400x500/141414/444?text=No+Image'}
          alt={event.nameEvent}
          className="ec-image"
        />
        {date && (
          <div className="ec-date-badge">
            <span className="ec-date-day">{date.day}</span>
            <span className="ec-date-month">{date.month}</span>
          </div>
        )}
        <div className="ec-favorite">
          <FavoriteButtonComponent event={event} onRemove={onRemove} favoriteIds={favoriteIds} />
        </div>
      </div>

      {/* Info e bottone */}
      <div className="ec-body">
        <h5 className="ec-title">{event.nameEvent}</h5>
        {event.location && (
          <p className="ec-location">
            <ion-icon name="location-outline"></ion-icon>
            {event.location}
          </p>
        )}
        <Link to={`/event/${event._id}`} state={{ event }} style={{ display: 'block' }}>
          <DetailButtonComponent />
        </Link>
      </div>

    </div>
  )
}
