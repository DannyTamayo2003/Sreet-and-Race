/*
 * EventListComponent.jsx — Lista eventi con paginazione server-side
 * Passa filtri e pagina corrente come query params al backend.
 * Il backend filtra, ordina e restituisce solo gli eventi della pagina richiesta.
 * Mostra 20 eventi per pagina.
 */

import React, { useEffect, useState } from 'react'
import EventCardComponent from './EventCardComponent'
import '../style/EventPageStyle.css'

const EVENTS_PER_PAGE = 20

export default function EventListComponent({ search = "", regionFilter = "", sortOrder = "date-desc", onResultCount }) {
  const [eventi, setEventi] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  // null = caricamento in corso, Set = dati pronti (anche Set vuoto se non loggato)
  const [favoriteIds, setFavoriteIds] = useState(null)

  // Quando cambiano i filtri, torna sempre alla prima pagina
  useEffect(function() {
    setCurrentPage(1)
  }, [search, regionFilter, sortOrder])

  // Fetch degli eventi al backend: riparte ogni volta che cambiano filtri o pagina
  useEffect(function() {
    setLoading(true)
    setError('')

    const params = new URLSearchParams({
      page: currentPage,
      limit: EVENTS_PER_PAGE,
      sort: sortOrder
    })
    if (search.trim()) params.set('search', search.trim())
    if (regionFilter) params.set('region', regionFilter)

    fetch(`${import.meta.env.VITE_API_URL}/api/eventi?${params.toString()}`)
      .then(function(res) {
        if (!res.ok) {
          return res.json().then(function(errPayload) {
            throw new Error(errPayload.message || 'Errore nel caricamento eventi')
          })
        }
        return res.json()
      })
      .then(function(data) {
        setEventi(Array.isArray(data.eventi) ? data.eventi : [])
        setTotalPages(data.totalPages || 1)
        if (onResultCount) onResultCount(data.total || 0)
      })
      .catch(function(err) {
        setError(err.message)
        setEventi([])
      })
      .finally(function() {
        setLoading(false)
      })
  }, [search, regionFilter, sortOrder, currentPage])

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

  return (
    <>
      <div className="eventListFlex">
        {loading && <p>Caricamento eventi...</p>}
        {!loading && error && <p>Errore: {error}</p>}
        {!loading && !error && eventi.map(function(event) {
          return <EventCardComponent key={event._id} event={event} favoriteIds={favoriteIds} />
        })}
        {!loading && !error && eventi.length === 0 && (
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
