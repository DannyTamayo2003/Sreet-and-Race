import React, { useState } from 'react'
import EventListComponent from '../components/EventListComponent'
import { CITTA_PER_REGIONE } from '../data/cittaPerRegione'
import '../style/EventPageStyle.css'

const REGIONI = Object.keys(CITTA_PER_REGIONE).sort()

export default function EventPage() {
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('date-desc')

  return (
    <>
      <div className="ep-banner">
        <h1 className="ep-banner-title">Eventi</h1>
        <p className="ep-banner-sub">Scopri raduni, car meeting e gare vicino a te</p>
      </div>

      <div className="ep-controls">
        <input
          type="text"
          placeholder="Cerca evento o città..."
          value={search}
          onChange={function(e) { setSearch(e.target.value) }}
          className="event-search-input"
        />
        <select
          value={regionFilter}
          onChange={function(e) { setRegionFilter(e.target.value) }}
          className="ep-region-select"
          translate="no"
        >
          <option value="">Tutte le regioni</option>
          {REGIONI.map(function(r) {
            return <option key={r} value={r}>{r}</option>
          })}
        </select>
      </div>

      <div className="ep-sort-row">
        {[['date-desc', 'Data ↓'], ['date-asc', 'Data ↑'], ['name-asc', 'A-Z']].map(function(item) {
          const val = item[0]
          const label = item[1]
          return (
            <button
              key={val}
              className={`ep-sort-btn${sortOrder === val ? ' ep-sort-btn--active' : ''}`}
              onClick={function() { setSortOrder(val) }}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="eventListContainer">
        <EventListComponent search={search} regionFilter={regionFilter} sortOrder={sortOrder} />
      </div>
    </>
  )
}
