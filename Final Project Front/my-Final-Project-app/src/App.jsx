/*
 * App.jsx — Componente radice dell'applicazione
 * Configura il routing: ogni <Route> associa un URL a una pagina.
 * NavBarComponent è sempre visibile; il contenuto cambia in base alla route.
 * Gestisce anche il menu mobile (menuOpen) che sfuma il contenuto principale.
 */

import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'

import NavBarComponent from './components/NavBarComponent'

import HomePage from './router-dom-page/HomePage'
import EventDetailPage from './router-dom-page/EventDetailPage'
import EventPage from './router-dom-page/EventPage'
import FavoriteEventPage from './router-dom-page/FavoriteEventPage'
import LoginUserPage from './router-dom-page/LoginUserPage'
import ContactsPage from './router-dom-page/ContactsPage'
import RegistrationPage from './router-dom-page/RegistrationPage'
import CreateEventPage from './router-dom-page/CreateEventPage'
import AccountPage from './router-dom-page/AccountPage'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

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
      <div id="mainContent" className={menuOpen ? "blurred" : ""}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/favorite" element={<FavoriteEventPage />} />
          <Route path="/eventpage" element={<EventPage />} />
          <Route path="/login" element={<LoginUserPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/createevent" element={<CreateEventPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
