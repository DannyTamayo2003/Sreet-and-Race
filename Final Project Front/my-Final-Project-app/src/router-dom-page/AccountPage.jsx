/*
 * AccountPage.jsx — Pagina account utente
 * Per ora mostra solo il pulsante di logout.
 * In futuro qui andranno i dati del profilo utente.
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import LogOutComponent from '../components/LogOutComponent'
import '../style/LogOutStyle.css'

export default function AccountPage() {
  const navigate = useNavigate()

  function logout() {
    // Rimuove il token JWT dal localStorage: l'utente risulterà non loggato
    localStorage.removeItem('token')
    alert('Logout effettuato!')
    navigate('/')
    window.location.reload()
  }

  return (
    <div>
      <h3>Logout</h3>
      <LogOutComponent logout={logout} />
    </div>
  )
}
