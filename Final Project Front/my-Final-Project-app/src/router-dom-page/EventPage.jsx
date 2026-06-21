/*
 * EventPage.jsx — Pagina lista eventi
 * Mostra tutti gli eventi creati dagli utenti con una barra di ricerca.
 * La ricerca filtra localmente per nome evento o città, senza nuove chiamate al server.
 */

import React, { useState } from 'react'
import EventListComponent from '../components/EventListComponent'
import '../style/EventPageStyle.css'

export default function EventPage() {
  const [search, setSearch] = useState("")

  return (
    <>
      <h1>Event Pages</h1>

      <div className="event-search-container">
        <input
          type="text"
          placeholder="Cerca evento o città..."
          value={search}
          onChange={function(e) { setSearch(e.target.value) }}
          className="event-search-input"
        />
      </div>

      <div className='eventListContainer'>
        {/* Passiamo il testo di ricerca al componente lista che filtra i risultati */}
        <EventListComponent search={search} />
      </div>
    </>
  )
}
