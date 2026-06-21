/*
 * CreateEvent.jsx — Form per la creazione di un nuovo evento
 * Raccoglie i dati dell'evento dall'utente e li invia al backend tramite POST.
 * Richiede autenticazione (token JWT in localStorage).
 */

import React, { useState } from 'react'

export default function CreateEvent() {
  // Lo stato "form" contiene i valori di tutti i campi del form
  const [form, setForm] = useState({
    nameEvent: '',
    description: '',
    data: '',
    location: '',
    orario: '',
    descrizioneDettagliata: '',
    organizzatore: '',
    image: ''
  })

  // Aggiorna il campo corrispondente nello stato ogni volta che l'utente digita.
  // [e.target.name] usa il nome del campo come chiave dinamica (es. "nameEvent", "location")
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Crea una copia del form da inviare al backend (non modifichiamo lo stato direttamente)
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
      const res = await fetch('http://localhost:3000/api/eventi/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Invia il token JWT per autenticare la richiesta
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      })

      const dataRes = await res.json()

      if (res.ok) {
        alert('Evento creato con successo!')
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
          Nome evento:
          <input
            type="text"
            name="nameEvent"
            value={form.nameEvent}
            onChange={handleChange}
            required
            className="wide-input"
          />
        </label>
      </div>

      <label>
        Descrizione:
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
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
          Location:
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Orario:
          <input
            type="text"
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
        <label>
          URL immagine:
          <input
            type="url"
            name="image"
            value={form.image}
            onChange={handleChange}
          />
        </label>
      </div>

      <label>
        Descrizione dettagliata:
        <textarea
          name="descrizioneDettagliata"
          value={form.descrizioneDettagliata}
          onChange={handleChange}
        />
      </label>

      <button type="submit">Crea evento</button>
    </form>
  )
}
