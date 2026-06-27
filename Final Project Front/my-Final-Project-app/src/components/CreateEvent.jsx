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
  const [formErrors, setFormErrors] = useState({})

  // Revoca l'URL dell'anteprima quando cambia o quando il componente si smonta,
  // per evitare memory leak (createObjectURL alloca memoria nel browser)
  useEffect(function() {
    return function() {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    // Rimuove l'errore del campo non appena l'utente inizia a modificarlo
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

    // La locandina non è un campo HTML del form ma uno stato separato, quindi va controllata manualmente
    if (!imageFile) {
      alert('La locandina è obbligatoria. Carica un\'immagine per continuare.')
      return
    }

    // Converte la data da 'YYYY-MM-DD' a ISO 8601 prima di aggiungerla al FormData
    let dataISO = ''
    if (form.data) {
      const dataObject = new Date(form.data)
      if (!isNaN(dataObject.getTime())) {
        dataISO = dataObject.toISOString()
      } else {
        alert('Per favore, inserisci una data valida.')
        return
      }
    }

    // FormData permette di inviare sia testo che file nella stessa richiesta (multipart/form-data).
    // NON impostare Content-Type manualmente: il browser lo fa da solo con il boundary corretto.
    const formData = new FormData()
    formData.append('nameEvent', form.nameEvent)
    formData.append('description', form.description)
    formData.append('data', dataISO)
    formData.append('location', form.location)
    formData.append('geoRegion', form.geoRegion)
    formData.append('orario', form.orario)
    formData.append('descrizioneDettagliata', form.descrizioneDettagliata)
    formData.append('organizzatore', form.organizzatore)
    formData.append('image', imageFile)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/eventi/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const dataRes = await res.json()

      if (res.ok) {
        navigate('/eventpage')
      } else if (dataRes.errors) {
        // Converte l'array di errori in un oggetto { nomeCampo: messaggio }
        const erroriPerCampo = {}
        dataRes.errors.forEach(function(err) {
          erroriPerCampo[err.path] = err.msg
        })
        setFormErrors(erroriPerCampo)
      } else {
        alert(dataRes.message || 'Errore: evento non creato. Riprova più tardi.')
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
