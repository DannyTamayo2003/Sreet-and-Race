/*
 * CreateEvent.jsx — Form per la creazione di un nuovo evento
 * Raccoglie i dati dell'evento dall'utente e li invia al backend tramite POST.
 * Richiede autenticazione (token JWT in localStorage).
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const REGIONI_ITALIANE = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia',
  'Toscana', 'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto'
]

export default function CreateEvent() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nameEvent: '',
    description: '',
    data: '',
    location: '',
    geoRegion: '',
    orario: '',
    descrizioneDettagliata: '',
    organizzatore: '',
  })

  // Stato separato per il file immagine e l'anteprima (non fa parte del JSON inviato al backend)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  // Revoca l'URL dell'anteprima quando cambia o quando il componente si smonta,
  // per evitare memory leak (createObjectURL alloca memoria nel browser)
  useEffect(function() {
    return function() {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const dataToSend = { ...form }

    // Il campo "data" arriva come stringa 'YYYY-MM-DD' dall'input HTML.
    // MongoDB si aspetta una data in formato ISO 8601 (es. "2025-06-21T00:00:00.000Z").
    if (form.data) {
      const dataObject = new Date(form.data)
      if (!isNaN(dataObject.getTime())) {
        dataToSend.data = dataObject.toISOString()
      } else {
        alert('Per favore, inserisci una data valida.')
        return
      }
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/eventi/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      })

      const dataRes = await res.json()

      if (res.ok) {
        navigate('/eventpage')
      } else {
        alert(dataRes.message || dataRes.error || 'Errore: evento non creato. Riprova più tardi.')
      }
    } catch (err) {
      alert('Errore di rete. Controlla la connessione e riprova.')
    }
  }

  return (
    <form className="create-event-form" onSubmit={handleSubmit}>
      <h2>Crea un nuovo evento</h2>

      <div className="centered-label">
        <label>
          Nome evento: <span className="char-count">{form.nameEvent.length}/50</span>
          <input
            type="text"
            name="nameEvent"
            value={form.nameEvent}
            onChange={handleChange}
            required
            maxLength={50}
            className="wide-input"
          />
        </label>
      </div>

      <label>
        Descrizione: <span className="char-count">{form.description.length}/150</span>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          maxLength={150}
        />
      </label>

      <div className="event-form-grid">
        <label>
          Data:
          <input
            type="date"
            name="data"
            value={form.data}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Città:
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Regione:
          <select name="geoRegion" value={form.geoRegion} onChange={handleChange}>
            <option value="">-- Seleziona regione --</option>
            {REGIONI_ITALIANE.map(function(regione) {
              return <option key={regione} value={regione}>{regione}</option>
            })}
          </select>
        </label>
        <label>
          Orario:
          <input
            type="time"
            name="orario"
            value={form.orario}
            onChange={handleChange}
          />
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
        Locandina evento:
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

      <button type="submit">Crea evento</button>
    </form>
  )
}
