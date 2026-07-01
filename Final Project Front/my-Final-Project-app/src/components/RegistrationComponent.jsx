/*
 * RegistrationComponent.jsx — Form di registrazione
 * Raccoglie i dati del nuovo utente e li invia al backend tramite POST.
 * La data di nascita viene convertita in formato ISO 8601 prima dell'invio.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../style/RegistrationStyle.css'

export default function RegistrationComponent() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nameUser: '',
    dateOfBirth: '',
    emailUser: '',
    pwdUser: ''
  })
  const [formErrors, setFormErrors] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' })
    }
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })
      const data = await res.json()

      if (res.ok) {
        navigate('/login')
      } else if (data.errors) {
        const erroriPerCampo = {}
        data.errors.forEach(function(err) {
          erroriPerCampo[err.path] = err.msg
        })
        setFormErrors(erroriPerCampo)
      } else {
        alert(data.message || 'Registrazione fallita. Riprova.')
      }
    } catch (err) {
      alert('Errore di rete. Controlla la connessione e riprova.')
    }
  }

  return (
    <form className="registration-form-horizontal" onSubmit={handleSubmit}>
      <div className="registration-row">
        <label>
          Nome:
          <input
            type="text"
            name="nameUser"
            value={form.nameUser}
            onChange={handleChange}
          />
          {formErrors.nameUser && <p className="form-error">{formErrors.nameUser}</p>}
        </label>
        <label>
          Data di nascita:
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
          />
          {formErrors.dateOfBirth && <p className="form-error">{formErrors.dateOfBirth}</p>}
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
          />
          {formErrors.emailUser && <p className="form-error">{formErrors.emailUser}</p>}
        </label>
        <label>
          Password:
          <input
            type="password"
            name="pwdUser"
            value={form.pwdUser}
            onChange={handleChange}
          />
          {formErrors.pwdUser && <p className="form-error">{formErrors.pwdUser}</p>}
        </label>
      </div>
      <button type="submit">Registrati</button>
    </form>
  )
}
