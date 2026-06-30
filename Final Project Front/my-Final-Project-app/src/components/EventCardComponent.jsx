/*
 * EventCardComponent.jsx — Card singolo evento
 * Mostra immagine, nome e descrizione di un evento.
 * Il click su "Dettagli" passa l'intero oggetto evento alla pagina di dettaglio
 * tramite router state, evitando una fetch aggiuntiva.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import FavoriteButtonComponent from './FavoriteButtonComponent'
import DetailButtonComponent from './DetailButtonComponent'
import '../style/DetailButtonStyle.css'

export default function EventCardComponent({ event }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    const day = d.getDate().toString().padStart(2, '0')
    const month = d.toLocaleString('it-IT', { month: 'short' }).toUpperCase()
    return { day, month }
  }

  const date = formatDate(event.data)

  return (
    <div className="card" style={{
      width: '18rem',
      border: 'none',
      borderRadius: '14px',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      background: '#141414',
      position: 'relative'
    }}>
      {/* Immagine con badge data */}
      <div style={{ width: '100%', aspectRatio: '4/5', overflow: 'hidden', position: 'relative' }}>
        <img
          src={event.image || 'https://placehold.co/400x500/141414/444?text=No+Image'}
          alt={event.nameEvent}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {date && (
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            background: '#7B2FFF',
            borderRadius: '8px',
            padding: '6px 10px',
            textAlign: 'center',
            minWidth: '44px',
            boxShadow: '0 2px 12px rgba(123,47,255,0.5)'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{date.day}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#ddd', letterSpacing: '0.05em' }}>{date.month}</div>
          </div>
        )}
        <div style={{
          position: 'absolute', top: '12px', right: '12px'
        }}>
          <FavoriteButtonComponent event={event} />
        </div>
      </div>

      <div className="card-body" style={{ padding: '14px 16px', background: '#141414' }}>
        <h5 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '4px', color: '#ffffff', fontWeight: '700' }}>
          {event.nameEvent}
        </h5>
        {event.location && (
          <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '10px', fontFamily: 'Arial, sans-serif' }}>
            📍 {event.location}
          </p>
        )}
        <Link to={`/event/${event._id}`} state={{ event }} style={{ display: 'block' }}>
          <DetailButtonComponent />
        </Link>
      </div>
    </div>
  )
}
