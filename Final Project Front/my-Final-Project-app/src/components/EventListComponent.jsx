/*
 * EventListComponent.jsx — Lista eventi
 * Carica tutti gli eventi dal backend una sola volta al montaggio del componente.
 * Filtra i risultati localmente in base al testo di ricerca passato come prop,
 * senza fare nuove chiamate al server ad ogni ricerca.
 * Mostra 9 eventi per pagina con bottoni di navigazione.
 */

import React, { useEffect, useState } from 'react'
import EventCardComponent from './EventCardComponent'
import '../style/EventPageStyle.css'

const EVENTS_PER_PAGE = 9

export default function EventListComponent({ search = "", regionFilter = "", sortOrder = "date-desc" }) {
  const [rawEvents, setRawEvents] = useState([])   // tutti gli eventi caricati dal backend
  const [loading, setLoading] = useState(false)    // true mentre la fetch è in corso
  const [error, setError] = useState('')           // messaggio di errore se la fetch fallisce
  const [currentPage, setCurrentPage] = useState(1)
  // null = caricamento in corso, Set = dati pronti (anche Set vuoto se non loggato)
  const [favoriteIds, setFavoriteIds] = useState(null)

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
  }, [])

  // Carica i preferiti una sola volta per tutta la lista, evitando N fetch identiche nelle card
  useEffect(function() {
    const token = localStorage.getItem('token')
    if (!token) {
      setFavoriteIds(new Set())
      return
    }
    fetch(`${import.meta.env.VITE_API_URL}/api/user/eventsFavourites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(function(res) {
      if (!res.ok) return []
      return res.json()
    })
    .then(function(data) {
      setFavoriteIds(new Set((data || []).map(function(ev) { return ev._id })))
    })
    .catch(function() {
      setFavoriteIds(new Set())
    })
  }, [])

  // Quando cambia un filtro o l'ordinamento, torna alla prima pagina
  useEffect(function() {
    setCurrentPage(1)
  }, [search, regionFilter, sortOrder])

  // Filtra per testo + regione, poi ordina
  const normalizedSearch = search.trim().toLowerCase()
  const filteredEvents = rawEvents
    .filter(function(event) {
      if (normalizedSearch) {
        const name = (event.nameEvent || '').toLowerCase()
        const location = (event.location || '').toLowerCase()
        if (!name.includes(normalizedSearch) && !location.includes(normalizedSearch)) return false
      }
      if (regionFilter && event.geoRegion !== regionFilter) return false
      return true
    })
    .sort(function(a, b) {
      if (sortOrder === 'date-desc') return new Date(b.data) - new Date(a.data)
      if (sortOrder === 'date-asc')  return new Date(a.data) - new Date(b.data)
      if (sortOrder === 'name-asc')  return (a.nameEvent || '').localeCompare(b.nameEvent || '')
      return 0
    })

  // Calcola il numero totale di pagine e gli eventi da mostrare nella pagina corrente
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE)
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE
  const eventsOnPage = filteredEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE)

  return (
    <>
      {!loading && !error && (
        <p className="ep-result-count">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'evento trovato' : 'eventi trovati'}
        </p>
      )}

      <div className="eventListFlex">
        {loading && <p>Caricamento eventi...</p>}
        {!loading && error && <p>Errore: {error}</p>}
        {!loading && !error && eventsOnPage.map(function(event) {
          return <EventCardComponent key={event._id} event={event} favoriteIds={favoriteIds} />
        })}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="ep-empty">
            <ion-icon name="calendar-outline"></ion-icon>
            <p>Nessun evento trovato.</p>
          </div>
        )}
      </div>

      {/* Mostra i controlli di paginazione solo se ci sono più pagine */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={function() { setCurrentPage(currentPage - 1) }}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            &laquo; Precedente
          </button>

          <span className="pagination-info">
            Pagina {currentPage} di {totalPages}
          </span>

          <button
            onClick={function() { setCurrentPage(currentPage + 1) }}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Successiva &raquo;
          </button>
        </div>
      )}
    </>
  )
}
