/*
 * LoginUserComponent.jsx — Form di login
 * Invia email e password al backend. Se le credenziali sono corrette,
 * salva il token JWT in localStorage con la chiave "token" e reindirizza alla home.
 */

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../style/LoginUserStyle.css'

export default function LoginUserComponent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailUser: email, pwdUser: password })
      })
      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('token', data.token)
        if (data.nameUser) localStorage.setItem('nameUser', data.nameUser)
        alert('Login effettuato!')
        navigate('/')
      } else {
        alert(data.message || 'Login fallito')
      }
    } catch (err) {
      alert('Errore di rete. Controlla la connessione e riprova.')
    }

    setEmail('')
    setPassword('')
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={function(e) { setEmail(e.target.value) }}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={function(e) { setPassword(e.target.value) }}
            required
          />
        </label>
        <button type="submit">Login</button>
      </form>
      <div className='RegistrationLink'>
        <Link to="/registration">Non hai un account? Registrati</Link>
      </div>
    </div>
  )
}
