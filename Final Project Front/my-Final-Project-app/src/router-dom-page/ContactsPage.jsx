import React from 'react'
import '../style/ContactsStyle.css'

export default function ContactsPage() {
  return (
    <div className="ct-page">

      {/* CARD INSTAGRAM */}
      <div className="ct-body">
        <div className="ct-ig-card">
          <div className="ct-ig-icon-wrap">
            <ion-icon name="logo-instagram" class="ct-ig-icon"></ion-icon>
          </div>
          <div className="ct-ig-handle">@streetandrace_</div>
          <p className="ct-ig-desc">
            Scrivici per segnalazioni, problemi o informazioni.<br />
            Seguici se vuoi restare aggiornato, oppure contattaci direttamente in DM.
          </p>
          <a
            href="https://instagram.com/streetandrace_"
            target="_blank"
            rel="noopener noreferrer"
            className="ct-ig-btn"
          >
            <ion-icon name="logo-instagram"></ion-icon>
            Seguici su Instagram
          </a>
        </div>

        {/* CHI SIAMO */}
        <div className="ct-about-card">
          <div className="ct-about-label">Chi siamo</div>
          <p className="ct-about-text">
            Street &amp; Race nasce come prototipo di una web app pensata per unire in un unico posto
            tutti gli eventi automobilistici d'Italia, principalmente raduni, car meeting e appuntamenti motorsport.
            Ogni evento è creato direttamente dagli utenti della community: è il vostro contributo a tenerla viva.
          </p>
          <div className="ct-about-meta">
            <span className="ct-about-badge">Progetto Beta</span>
            <span className="ct-about-badge">v1.0 — 2026</span>
          </div>
        </div>
      </div>

    </div>
  )
}
