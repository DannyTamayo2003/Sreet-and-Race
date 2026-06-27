/*
 * EditEventPage.jsx — Pagina di modifica di un evento esistente
 * Riceve i dati dell'evento tramite router state (navigate con { state: { evento } }).
 * Pre-popola il form e invia una richiesta PUT al backend.
 * Solo il creatore dell'evento può accedere a questa pagina.
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../style/CreateEventStyle.css'

const REGIONI_ITALIANE = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia',
  'Toscana', 'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto'
]

export default function EditEventPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const evento = location.state?.evento

  // Se l'utente arriva direttamente senza state, lo rimanda all'account
  useEffect(function() {
    if (!evento) {
      navigate('/account')
    }
  }, [evento, navigate])

  if (!evento) return null

  // Converte la data ISO ('2024-06-15T00:00:00.000Z') in 'YYYY-MM-DD' per l'input date
  const dataFormattata = evento.data ? new Date(evento.data).toISOString().split('T')[0] : ''

  const [form, setForm] = useState({
    nameEvent: evento.nameEvent || '',
    description: evento.description || '',
    data: dataFormattata,
    location: evento.location || '',
    geoRegion: evento.geoRegion || '',
    orario: evento.orario || '',
    descrizioneDettagliata: evento.descrizioneDettagliata || '',
    organizzatore: evento.organizzatore || '',
  })

  // imageFile è null se l'utente non cambia immagine → il backend mantiene quella esistente
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(evento.image || '')
  const [formErrors, setFormErrors] = useState({})

  // Revoca l'URL locale solo se è stato creato da noi con createObjectURL
  useEffect(function() {
    return function() {
      if (imageFile && imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview, imageFile])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' })
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    let dataISO = ''
    if (form.data) {
      const dataObject = new Date(form.data)
      if (!isNaN(dataObject.getTime())) {
        dataISO = dataObject.toISOString()
      } else {
        alert('Inserisci una data valida.')
        return
      }
    }

    const formData = new FormData()
    formData.append('nameEvent', form.nameEvent)
    formData.append('description', form.description)
    formData.append('data', dataISO)
    formData.append('location', form.location)
    formData.append('geoRegion', form.geoRegion)
    formData.append('orario', form.orario)
    formData.append('descrizioneDettagliata', form.descrizioneDettagliata)
    formData.append('organizzatore', form.organizzatore)

    // Aggiunge l'immagine solo se l'utente ne ha caricata una nuova
    if (imageFile) {
      formData.append('image', imageFile)
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/eventi/${evento._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        alert('Evento aggiornato con successo!')
        navigate('/account')
      } else if (data.errors) {
        const erroriPerCampo = {}
        data.errors.forEach(function(err) {
          erroriPerCampo[err.path] = err.msg
        })
        setFormErrors(erroriPerCampo)
      } else {
        alert(data.message || 'Errore durante l\'aggiornamento. Riprova.')
      }
    } catch (err) {
      alert('Errore di rete. Controlla la connessione e riprova.')
    }
  }

  return (
    <form className="create-event-form" onSubmit={handleSubmit}>
      <h2>Modifica evento</h2>

      <div className="centered-label">
        <label>
          Nome evento: <span className="char-count">{form.nameEvent.length}/50</span>
          <input
            type="text"
            name="nameEvent"
            value={form.nameEvent}
            onChange={handleChange}
            maxLength={50}
            className="wide-input"
          />
        </label>
        {formErrors.nameEvent && <p className="form-error">{formErrors.nameEvent}</p>}
      </div>

      <label>
        Descrizione: <span className="char-count">{form.description.length}/150</span>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          maxLength={150}
        />
      </label>
      {formErrors.description && <p className="form-error">{formErrors.description}</p>}

      <div className="event-form-grid">
        <label>
          Data:
          <input
            type="date"
            name="data"
            value={form.data}
            onChange={handleChange}
          />
          {formErrors.data && <p className="form-error">{formErrors.data}</p>}
        </label>
        <label>
          Città:
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
          />
          {formErrors.location && <p className="form-error">{formErrors.location}</p>}
        </label>
        <label>
          Regione:
          <select name="geoRegion" value={form.geoRegion} onChange={handleChange}>
            <option value="">-- Seleziona regione --</option>
            {REGIONI_ITALIANE.map(function(regione) {
              return <option key={regione} value={regione}>{regione}</option>
            })}
          </select>
          {formErrors.geoRegion && <p className="form-error">{formErrors.geoRegion}</p>}
        </label>
        <label>
          Orario:
          <input
            type="time"
            name="orario"
            value={form.orario}
            onChange={handleChange}
          />
          {formErrors.orario && <p className="form-error">{formErrors.orario}</p>}
        </label>
        <label>
          Organizzatore:
          <input
            type="text"
            name="organizzatore"
            value={form.organizzatore}
            onChange={handleChange}
          />
        </label>
      </div>

      <label>
        Descrizione dettagliata: <span className="char-count">{form.descrizioneDettagliata.length}/500</span>
        <textarea
          name="descrizioneDettagliata"
          value={form.descrizioneDettagliata}
          onChange={handleChange}
          maxLength={500}
        />
      </label>

      <label>
        Locandina evento (lascia vuoto per mantenere quella attuale):
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </label>
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Anteprima locandina"
          style={{ maxWidth: '200px', marginTop: '8px', display: 'block' }}
        />
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button type="submit">Salva modifiche</button>
        <button type="button" onClick={function() { navigate('/account') }} style={{ background: '#aaa' }}>
          Annulla
        </button>
      </div>
    </form>
  )
}
