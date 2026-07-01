import React, { useState } from 'react'
import EventListComponent from '../components/EventListComponent'
import { CITTA_PER_REGIONE } from '../data/cittaPerRegione'
import '../style/EventPageStyle.css'

const REGIONI = Object.keys(CITTA_PER_REGIONE).sort()

export default function EventPage() {
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('date-desc')
  const [resultCount, setResultCount] = useState(null)

  return (
    <>
      <div className="ep-fixed-bar">
        <h1 className="ep-fixed-bar-title">Eventi</h1>

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
          {[['date-desc', 'Data ↓'], ['date-asc', 'Data ↑']].map(function(item) {
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

        {resultCount !== null && (
          <p className="ep-result-count">
            {resultCount} {resultCount === 1 ? 'evento trovato' : 'eventi trovati'}
          </p>
        )}
      </div>

      <div className="ep-content">
        <EventListComponent
          search={search}
          regionFilter={regionFilter}
          sortOrder={sortOrder}
          onResultCount={setResultCount}
        />
      </div>
    </>
  )
}
