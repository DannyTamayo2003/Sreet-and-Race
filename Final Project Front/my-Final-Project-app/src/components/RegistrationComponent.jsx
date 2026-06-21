/*
 * RegistrationComponent.jsx — Form di registrazione
 * Raccoglie i dati del nuovo utente e li invia al backend tramite POST.
 * La data di nascita viene convertita in formato ISO 8601 prima dell'invio.
 */

import React, { useState } from 'react'
import '../style/RegistrationStyle.css'

export default function RegistrationComponent() {
  const [form, setForm] = useState({
    nameUser: '',
    dateOfBirth: '',
    emailUser: '',
    pwdUser: ''
  })

  // Aggiorna il campo corrispondente ogni volta che l'utente digita
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const dataToSend = { ...form }

    // L'input HTML di tipo "date" restituisce una stringa 'YYYY-MM-DD'.
    // MongoDB si aspetta il formato ISO 8601 (es. "1990-05-20T00:00:00.000Z").
    if (form.dateOfBirth) {
      const dateObject = new Date(form.dateOfBirth)
      if (!isNaN(dateObject.getTime())) {
        dataToSend.dateOfBirth = dateObject.toISOString()
      } else {
        alert('Per favore, inserisci una data di nascita valida.')
        return
      }
    }

    try {
      const res = await fetch('http://localhost:3000/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })
      const data = await res.json()

      if (res.ok) {
        alert('Registrazione completata! Ora puoi accedere con le tue credenziali.')
      } else {
        alert(data.message || data.error || 'Registrazione fallita. Riprova.')
      }
    } catch (err) {
      alert('Errore di rete. Controlla la connessione e riprova.')
    }
  }

  return (
    <form className="registration-form-horizontal" onSubmit={handleSubmit}>
      <h2>Registration</h2>
      <div className="registration-row">
        <label>
          Nome:
          <input
            type="text"
            name="nameUser"
            value={form.nameUser}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Data di nascita:
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div className="registration-row">
        <label>
          Email:
          <input
            type="email"
            name="emailUser"
            value={form.emailUser}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="pwdUser"
            value={form.pwdUser}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <button type="submit">Registrati</button>
    </form>
  )
}
