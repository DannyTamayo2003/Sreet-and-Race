// EventDetailPage.jsx
import { useParams } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import mockEvents from '../mocks/mockEvents'
import '../style/EventDetailStyle.css'


export default function EventDetailPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {

    const mockEvent = mockEvents.find(e => String(e.id) === String(id))
    if (mockEvent) {
      setEvent(mockEvent)
      setLoading(false)
      return
    }

    // Altrimenti prova la fetch API
    fetch(`http://localhost:3000/api/eventi/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Evento non trovato')
        return res.json()
      })
      .then(data => {
        setEvent(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div>Caricamento...</div>
  if (error) return <div>{error}</div>
  if (!event) return <div>Evento non trovato</div>

  return (
    <div className="eventDetailHero">
      <div
        className="eventDetailBg"
        style={{
          backgroundImage: `url(${event.img || event.image})`
        }}
      />
      <div className="eventDetailContent">
        <h1 className="eventDetailTitle">{event.nome || event.nameEvent}</h1>
        <h3 className="eventDetailSubtitle">{event.descrizione || event.description}</h3>
        
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