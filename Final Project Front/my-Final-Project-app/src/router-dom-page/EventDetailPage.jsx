/*
 * EventDetailPage.jsx — Pagina di dettaglio di un singolo evento
 * Mostra tutte le informazioni di un evento.
 *
 * Strategia di caricamento dati (in ordine di priorità):
 * 1. Se l'utente arriva dalla card eventi, l'oggetto evento è già nel router state → nessuna fetch
 * 2. Altrimenti, carica l'evento dal backend tramite l'ID nell'URL
 */

import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import '../style/EventDetailStyle.css'

export default function EventDetailPage() {
  const { id } = useParams()           // ID dell'evento dall'URL (es. /event/abc123)
  const location = useLocation()       // Accede allo state passato dal router
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(function() {
    // Caso 1: evento già disponibile dal router state (click su una card)
    if (location.state && location.state.event) {
      setEvent(location.state.event)
      setLoading(false)
      return
    }

    // Caso 2: nessun state disponibile, carica dal backend tramite ID
    fetch('http://localhost:3000/api/eventi/' + id)
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

  if (loading) return <div>Caricamento...</div>
  if (error) return <div>{error}</div>
  if (!event) return <div>Evento non trovato</div>

  return (
    <div className="eventDetailHero">
      {/* Immagine di sfondo dell'evento */}
      <div
        className="eventDetailBg"
        style={{ backgroundImage: `url(${event.image})` }}
      />

      <div className="eventDetailContent">
        <h1 className="eventDetailTitle">{event.nameEvent}</h1>
        <h3 className="eventDetailSubtitle">{event.description}</h3>

        <div className="eventDetailInfoList">
          {event.location && (
            <div className="eventDetailRow">
              <span className="eventDetailLabel">Luogo:</span>
              {event.location}
            </div>
          )}
          {event.data && (
            <div className="eventDetailRow">
              <span className="eventDetailLabel">Data:</span>
              {event.data}
            </div>
          )}
          {event.orario && (
            <div className="eventDetailRow">
              <span className="eventDetailLabel">Orario:</span>
              {event.orario}
            </div>
          )}
          {event.descrizioneDettagliata && (
            <div className="eventDetailRow eventDetailDettagliata">
              <span className="eventDetailLabel">Descrizione dettagliata:</span>
              {event.descrizioneDettagliata}
            </div>
          )}
          {event.organizzatore && (
            <div className="eventDetailRow">
              <span className="eventDetailLabel">Organizzatore:</span>
              {event.organizzatore}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
