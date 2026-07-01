/*
 * EditEventPage.jsx — Pagina di modifica di un evento esistente
 * Riceve i dati dell'evento tramite router state (navigate con { state: { evento } }).
 * Pre-popola il form e invia una richiesta PUT al backend.
 * Solo il creatore dell'evento può accedere a questa pagina.
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../style/CreateEventStyle.css'
import { CITTA_PER_REGIONE } from '../data/cittaPerRegione'

const REGIONI_ITALIANE = Object.keys(CITTA_PER_REGIONE).sort()

export default function EditEventPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const evento = location.state?.evento

  // Converte la data ISO in 'YYYY-MM-DD' per l'input date — safe anche se evento è undefined
  const dataFormattata = evento?.data ? new Date(evento.data).toISOString().split('T')[0] : ''

  // Tutti gli useState/useEffect devono stare PRIMA di qualsiasi return condizionale (Rules of Hooks)
  const [form, setForm] = useState({
    nameEvent: evento?.nameEvent || '',
    geoRegion: evento?.geoRegion || '',
    location: evento?.location || '',
    data: dataFormattata,
    orario: evento?.orario || '',
    organizzatore: evento?.organizzatore || '',
    via: evento?.via || '',
    descrizioneDettagliata: evento?.descrizioneDettagliata || '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(evento?.image || '')
  const [formErrors, setFormErrors] = useState({})

  // Se l'utente arriva senza state o non è il creatore, rimanda via
  useEffect(function() {
    if (!evento) {
      navigate('/account')
      return
    }
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    // Decodifica il payload JWT lato client (senza verifica firma — solo per UX)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.userId && evento.creatorId && payload.userId !== evento.creatorId.toString()) {
        navigate('/eventpage')
      }
    } catch {}
  }, [evento, navigate])

  // Revoca l'URL locale solo se è stato creato da noi con createObjectURL
  useEffect(function() {
    return function() {
      if (imageFile && imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview, imageFile])

  if (!evento) return null

  function handleChange(e) {
    const { name, value } = e.target
    if (name === 'geoRegion') {
      setForm({ ...form, geoRegion: value, location: '' })
    } else {
      setForm({ ...form, [name]: value })
    }
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' })
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
    formData.append('description', form.descrizioneDettagliata.substring(0, 150))
    formData.append('data', dataISO)
    formData.append('geoRegion', form.geoRegion)
    formData.append('location', form.location)
    formData.append('orario', form.orario)
    formData.append('organizzatore', form.organizzatore)
    formData.append('via', form.via)
    formData.append('descrizioneDettagliata', form.descrizioneDettagliata)

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

      <div className="event-form-grid">
        <label>
          Regione:
          <select name="geoRegion" value={form.geoRegion} onChange={handleChange} translate="no">
            <option value="">-- Seleziona regione --</option>
            {REGIONI_ITALIANE.map(function(regione) {
              return <option key={regione} value={regione}>{regione}</option>
            })}
          </select>
          {formErrors.geoRegion && <p className="form-error">{formErrors.geoRegion}</p>}
        </label>
        <label>
          Città:
          <select
            name="location"
            value={form.location}
            onChange={handleChange}
            disabled={!form.geoRegion}
          >
            <option value="">
              {form.geoRegion ? '-- Seleziona città --' : '-- Seleziona prima una regione --'}
            </option>
            {(CITTA_PER_REGIONE[form.geoRegion] || []).map(function(citta) {
              return <option key={citta} value={citta}>{citta}</option>
            })}
          </select>
          {formErrors.location && <p className="form-error">{formErrors.location}</p>}
        </label>
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
        <label>
          Via / Indirizzo:
          <input
            type="text"
            name="via"
            value={form.via}
            onChange={handleChange}
            placeholder="Es. Via Roma 1, Milano"
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
          accept="image/jpeg,image/png,image/webp,image/gif"
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
        <button type="button" onClick={function() { navigate('/account') }}>
          Annulla
        </button>
      </div>
    </form>
  )
}
