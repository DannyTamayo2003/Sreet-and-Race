import React, { useEffect, useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import '../style/EventDetailStyle.css'

export default function EventDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(function() {
    if (location.state && location.state.event) {
      setEvent(location.state.event)
      setLoading(false)
      return
    }
    fetch(`${import.meta.env.VITE_API_URL}/api/eventi/${id}`)
      .then(function(res) {
        if (!res.ok) throw new Error('Evento non trovato')
        return res.json()
      })
      .then(function(data) {
        setEvent(data)
        setLoading(false)
      })
      .catch(function(err) {
        setError(err.message)
        setLoading(false)
      })
  }, [id, location.state])

  if (loading) return <div className="ed-status">Caricamento...</div>
  if (error) return <div className="ed-status ed-error">{error}</div>
  if (!event) return <div className="ed-status">Evento non trovato</div>

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  return (
    <div className="ed-page">

      {/* HERO */}
      <div className="ed-hero">
        <div
          className="ed-hero-bg"
          style={{ backgroundImage: `url(${event.image || 'https://placehold.co/1200x500/141414/333?text=No+Image'})` }}
        />
        <div className="ed-hero-overlay" />
        <div className="ed-hero-content">
          <Link to="/eventpage" className="ed-back">
            ← Torna indietro
          </Link>
          <h1 className="ed-title">{event.nameEvent}</h1>
          <div className="ed-hero-meta">
            {event.location && (
              <span className="ed-meta-item">
                <ion-icon name="location-outline"></ion-icon>
                {event.location}
              </span>
            )}
            {event.orario && (
              <span className="ed-meta-item">
                <ion-icon name="time-outline"></ion-icon>
                Dalle {event.orario}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="ed-body">

        {/* COLONNA SINISTRA — Descrizioni */}
        <div className="ed-col-main">
          <div className="ed-section">
            <h3 className="ed-section-title">Informazioni</h3>
            <p className="ed-description">{event.description}</p>
          </div>

          {event.descrizioneDettagliata && (
            <div className="ed-section">
              <h3 className="ed-section-title">Descrizione dettagliata</h3>
              <p className="ed-description">{event.descrizioneDettagliata}</p>
            </div>
          )}
        </div>

        {/* COLONNA DESTRA — Info rapide */}
        <div className="ed-col-side">
          <div className="ed-info-card">
            {event.data && (
              <div className="ed-info-row">
                <ion-icon name="calendar-outline"></ion-icon>
                <div>
                  <div className="ed-info-label">Data</div>
                  <div className="ed-info-value">{formatDate(event.data)}</div>
                </div>
              </div>
            )}
            {event.orario && (
              <div className="ed-info-row">
                <ion-icon name="time-outline"></ion-icon>
                <div>
                  <div className="ed-info-label">Orario</div>
                  <div className="ed-info-value">{event.orario}</div>
                </div>
              </div>
            )}
            {event.location && (
              <div className="ed-info-row">
                <ion-icon name="location-outline"></ion-icon>
                <div>
                  <div className="ed-info-label">Luogo</div>
                  <div className="ed-info-value">{event.location}</div>
                </div>
              </div>
            )}
            {event.organizzatore && (
              <div className="ed-info-row">
                <ion-icon name="person-outline"></ion-icon>
                <div>
                  <div className="ed-info-label">Organizzatore</div>
                  <div className="ed-info-value">{event.organizzatore}</div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
