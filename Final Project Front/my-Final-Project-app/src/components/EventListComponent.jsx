/*
 * EventListComponent.jsx — Lista eventi
 * Carica tutti gli eventi dal backend una sola volta al montaggio del componente.
 * Filtra i risultati localmente in base al testo di ricerca passato come prop,
 * senza fare nuove chiamate al server ad ogni ricerca.
 */

import React, { useEffect, useState } from 'react'
import EventCardComponent from './EventCardComponent'
import '../style/EventPageStyle.css'

export default function EventListComponent({ search = "" }) {
  const [rawEvents, setRawEvents] = useState([])   // tutti gli eventi caricati dal backend
  const [loading, setLoading] = useState(false)    // true mentre la fetch è in corso
  const [error, setError] = useState('')           // messaggio di errore se la fetch fallisce

  useEffect(function() {
    setLoading(true)
    setError('')

    // Carica tutti gli eventi dal backend
    fetch(`${import.meta.env.VITE_API_URL}/api/eventi`)
      .then(function(res) {
        if (!res.ok) {
          return res.json().then(function(errPayload) {
            throw new Error(errPayload.message || 'Errore nel caricamento eventi')
          })
        }
        return res.json()
      })
      .then(function(data) {
        setRawEvents(Array.isArray(data) ? data : [])
      })
      .catch(function(err) {
        setError(err.message)
        setRawEvents([])
      })
      .finally(function() {
        setLoading(false)
      })
  }, []) // [] significa: esegui solo al primo montaggio del componente

  // Filtra localmente: cerca nel nome evento e nella città
  const normalizedSearch = search.trim().toLowerCase()
  const filteredEvents = rawEvents.filter(function(event) {
    if (!normalizedSearch) return true
    const name = (event.nameEvent || '').toLowerCase()
    const location = (event.location || '').toLowerCase()
    return name.includes(normalizedSearch) || location.includes(normalizedSearch)
  })

  return (
    <div className="eventListFlex">
      {loading && <p>Caricamento eventi...</p>}
      {!loading && error && <p>Errore: {error}</p>}
      {!loading && !error && filteredEvents.map(function(event) {
        return <EventCardComponent key={event._id} event={event} />
      })}
      {!loading && !error && filteredEvents.length === 0 && <p>Nessun evento trovato.</p>}
    </div>
  )
}
