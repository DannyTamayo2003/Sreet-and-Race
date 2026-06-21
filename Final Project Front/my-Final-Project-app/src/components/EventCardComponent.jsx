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
  return (
    <div className="card" style={{ width: '18rem', minHeight: '200px' }}>
      {/* Mostra l'immagine dell'evento; se non disponibile mostra un segnaposto */}
      <img
        src={event.image || 'https://placehold.co/286x180?text=Nessuna+immagine'}
        className="card-img-top"
        alt={event.nameEvent}
      />
      <div className="card-body">
        <h5 className="card-title">{event.nameEvent}</h5>
        <p className="card-text">{event.description}</p>

        {/* Passa l'evento completo via state per evitare una seconda fetch nella pagina dettaglio */}
        <Link to={`/event/${event._id}`} state={{ event }}>
          <DetailButtonComponent />
        </Link>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
          <FavoriteButtonComponent event={event} />
        </div>
      </div>
    </div>
  )
}
