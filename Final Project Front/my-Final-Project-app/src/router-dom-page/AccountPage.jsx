import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../style/AccountPageStyle.css'

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

    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, { headers }).then(function(r) {
        if (!r.ok) throw new Error('Token scaduto o non valido')
        return r.json()
      }),
      fetch(`${import.meta.env.VITE_API_URL}/api/user/myEvents`, { headers }).then(function(r) {
        if (!r.ok) throw new Error('Token scaduto o non valido')
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
      localStorage.removeItem('nameUser')
      navigate('/login')
    })
  }, [token])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('nameUser')
    navigate('/')
  }

  function handleEdit(evento) {
    navigate(`/edit-event/${evento._id}`, { state: { evento } })
  }

  function handleDelete(eventoId) {
    if (!window.confirm('Sei sicuro di voler eliminare questo evento?')) return
    fetch(`${import.meta.env.VITE_API_URL}/api/eventi/${eventoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(function(res) {
      if (res.ok) {
        setMyEvents(function(prev) { return prev.filter(function(ev) { return ev._id !== eventoId }) })
      } else {
        return res.json().then(function(d) { throw new Error(d.message) })
      }
    })
    .catch(function() { alert('Errore durante l\'eliminazione. Riprova.') })
  }

  if (loading) return <div className="account-status">Caricamento...</div>
  if (error) return <div className="account-status error">{error}</div>

  const formatDate = function(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="account-page">

      {/* Header profilo */}
      {profilo && (
        <div className="account-header">
          <ion-icon name="person-circle-outline" class="account-avatar"></ion-icon>
          <div>
            <h2 className="account-name">{profilo.nameUser}</h2>
            <p className="account-email">{profilo.emailUser}</p>
          </div>
        </div>
      )}

      {/* Info card */}
      {profilo && (
        <div className="account-info-card">
          <p className="account-section-title">Dati account</p>
          <div className="account-info-row">
            <ion-icon name="person-outline"></ion-icon>
            <div>
              <div className="account-info-label">Nome</div>
              <div className="account-info-value">{profilo.nameUser}</div>
            </div>
          </div>
          <div className="account-info-row">
            <ion-icon name="mail-outline"></ion-icon>
            <div>
              <div className="account-info-label">Email</div>
              <div className="account-info-value">{profilo.emailUser}</div>
            </div>
          </div>
          <div className="account-info-row">
            <ion-icon name="calendar-outline"></ion-icon>
            <div>
              <div className="account-info-label">Data di nascita</div>
              <div className="account-info-value">{formatDate(profilo.dateOfBirth)}</div>
            </div>
          </div>
        </div>
      )}

      {/* I miei eventi */}
      <div className="account-events-section">
        <p className="account-section-title">I miei eventi</p>
        {myEvents.length === 0 ? (
          <p className="account-events-empty">Non hai ancora creato nessun evento.</p>
        ) : (
          <div className="account-event-list">
            {myEvents.map(function(evento) {
              return (
                <div className="account-event-item" key={evento._id}>
                  {evento.image && (
                    <img className="account-event-thumb" src={evento.image} alt={evento.nameEvent} />
                  )}
                  <div className="account-event-info">
                    <p className="account-event-name">{evento.nameEvent}</p>
                    <span className="account-event-meta">
                      {evento.location} — {formatDate(evento.data)}
                    </span>
                  </div>
                  <div className="account-event-actions">
                    <button className="account-btn-edit" onClick={function() { handleEdit(evento) }}>Modifica</button>
                    <button className="account-btn-delete" onClick={function() { handleDelete(evento._id) }}>Elimina</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="account-logout-section">
        <button className="account-logout-btn" onClick={logout}>Logout</button>
      </div>

    </div>
  )
}
