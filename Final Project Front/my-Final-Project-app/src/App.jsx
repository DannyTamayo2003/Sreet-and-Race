/*
 * App.jsx — Componente radice dell'applicazione
 * Configura il routing: ogni <Route> associa un URL a una pagina.
 * NavBarComponent è sempre visibile; il contenuto cambia in base alla route.
 * Gestisce anche il menu mobile (menuOpen) che sfuma il contenuto principale.
 */

import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'

import NavBarComponent from './components/NavBarComponent'
import PageBannerComponent from './components/PageBannerComponent'

import HomePage from './router-dom-page/HomePage'
import EventDetailPage from './router-dom-page/EventDetailPage'
import EventPage from './router-dom-page/EventPage'
import FavoriteEventPage from './router-dom-page/FavoriteEventPage'
import LoginUserPage from './router-dom-page/LoginUserPage'
import ContactsPage from './router-dom-page/ContactsPage'
import RegistrationPage from './router-dom-page/RegistrationPage'
import CreateEventPage from './router-dom-page/CreateEventPage'
import AccountPage from './router-dom-page/AccountPage'
import EditEventPage from './router-dom-page/EditEventPage'

function PrivateRoute({ element }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return element
}

const BANNER_CONFIG = {
  '/favorite':     { title: 'Preferiti',       subtitle: 'Gli eventi che hai salvato' },
  '/login':        { title: 'Accedi',          subtitle: 'Entra nel tuo account Street & Race' },
  '/registration': { title: 'Registrati',      subtitle: 'Crea il tuo account gratuitamente' },
  '/createevent':  { title: 'Crea Evento',     subtitle: 'Condividi il tuo evento con la community' },
  '/account':      { title: 'Il mio Account',  subtitle: 'Gestisci il tuo profilo e i tuoi eventi' },
  '/contacts':     { title: 'Contatti',        subtitle: 'Il modo più veloce per contattarci' },
}

function getBannerData(pathname) {
  if (BANNER_CONFIG[pathname]) return BANNER_CONFIG[pathname]
  if (pathname.startsWith('/event/')) return { title: 'Dettaglio Evento', subtitle: 'Tutte le informazioni sull\'evento' }
  if (pathname.startsWith('/edit-event/')) return { title: 'Modifica Evento', subtitle: 'Aggiorna i dettagli del tuo evento' }
  return null
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const bannerData = getBannerData(location.pathname)

  useEffect(function() {
    // Chiude il menu mobile automaticamente quando si passa a schermo desktop
    function handleResize() {
      if (window.innerWidth >= 992) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return function() {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div id="appLayout">
      <NavBarComponent menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <div id="mainContent" className={[menuOpen ? "blurred" : "", bannerData ? "has-banner" : ""].filter(Boolean).join(" ")}>
        {bannerData && <PageBannerComponent title={bannerData.title} subtitle={bannerData.subtitle} />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/favorite" element={<PrivateRoute element={<FavoriteEventPage />} />} />
          <Route path="/eventpage" element={<EventPage />} />
          <Route path="/login" element={<LoginUserPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/createevent" element={<PrivateRoute element={<CreateEventPage />} />} />
          <Route path="/account" element={<PrivateRoute element={<AccountPage />} />} />
          <Route path="/edit-event/:id" element={<PrivateRoute element={<EditEventPage />} />} />
          <Route path="*" element={
            <div style={{ padding: '80px 32px', textAlign: 'center', color: '#aaaaaa' }}>
              <h2 style={{ color: '#ffffff', fontFamily: 'Orbitron, sans-serif', marginBottom: '12px' }}>404</h2>
              <p>Pagina non trovata.</p>
            </div>
          } />
        </Routes>
      </div>
    </div>
  )
}

export default App
