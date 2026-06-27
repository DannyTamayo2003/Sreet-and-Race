/*
 * AccountPage.jsx — Pagina profilo utente
 * Mostra i dati del profilo e la lista degli eventi creati dall'utente.
 * Permette di modificare o eliminare i propri eventi.
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LogOutComponent from '../components/LogOutComponent'
import '../style/LogOutStyle.css'

export default function AccountPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [profilo, setProfilo] = useState(null)
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(function() {
    if (!token) {
      setError('Devi essere loggato per vedere il tuo profilo.')
      setLoading(false)
      return
    }

    const headers = { 'Authorization': `Bearer ${token}` }

    // Carica profilo e eventi in parallelo con Promise.all
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, { headers }).then(function(r) {
        if (!r.ok) throw new Error('Token scaduto o non valido');
        return r.json()
      }),
      fetch(`${import.meta.env.VITE_API_URL}/api/user/myEvents`, { headers }).then(function(r) {
        if (!r.ok) throw new Error('Token scaduto o non valido');
        return r.json()
      })
    ])
    .then(function([profiloData, eventiData]) {
      setProfilo(profiloData)
      setMyEvents(eventiData)
      setLoading(false)
    })
    .catch(function() {
      localStorage.removeItem('token')
      navigate('/login')
    })
  }, [token])

  function logout() {
    localStorage.removeItem('token')
    alert('Logout effettuato!')
    navigate('/')
    window.location.reload()
  }

  function handleEdit(evento) {
    navigate(`/edit-event/${evento._id}`, { state: { evento } })
  }

  function handleDelete(eventoId) {
    if (!window.confirm('Sei sicuro di voler eliminare questo evento? L\'operazione è irreversibile.')) return

    fetch(`${import.meta.env.VITE_API_URL}/api/eventi/${eventoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(function(res) {
      if (res.ok) {
        // Rimuove l'evento dalla lista locale senza ricaricare la pagina
        setMyEvents(function(prev) {
          return prev.filter(function(ev) { return ev._id !== eventoId })
        })
      } else {
        return res.json().then(function(d) { throw new Error(d.message) })
      }
    })
    .catch(function(err) { alert('Errore: ' + err.message) })
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Caricamento...</p>
  if (error) return <p style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>{error}</p>

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>

      {/* Dati profilo */}
      <h2>Il mio profilo</h2>
      {profilo && (
        <div style={{ background: '#f5f5f5', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ margin: '0.3rem 0' }}><strong>Nome:</strong> {profilo.nameUser}</p>
          <p style={{ margin: '0.3rem 0' }}><strong>Email:</strong> {profilo.emailUser}</p>
          <p style={{ margin: '0.3rem 0' }}><strong>Data di nascita:</strong> {new Date(profilo.dateOfBirth).toLocaleDateString('it-IT')}</p>
        </div>
      )}

      <LogOutComponent logout={logout} />

      {/* Lista eventi creati dall'utente */}
      <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>I miei eventi</h3>

      {myEvents.length === 0 && (
        <p style={{ color: '#777' }}>Non hai ancora creato nessun evento.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {myEvents.map(function(evento) {
          return (
            <div
              key={evento._id}
              style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}
            >
              {/* Thumbnail evento */}
              {evento.image && (
                <img
                  src={evento.image}
                  alt={evento.nameEvent}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                />
              )}

              {/* Info evento */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>{evento.nameEvent}</strong>
                <span style={{ fontSize: '0.85rem', color: '#555' }}>
                  {evento.location} — {new Date(evento.data).toLocaleDateString('it-IT')}
                </span>
              </div>

              {/* Bottoni azioni */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={function() { handleEdit(evento) }}
                >
                  Modifica
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={function() { handleDelete(evento._id) }}
                >
                  Elimina
                </button>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
