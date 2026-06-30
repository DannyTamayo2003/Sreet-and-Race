/*
 * HomePage.jsx — Landing Page
 * Pagina principale dell'app, pensata come vetrina del brand "Street & Race".
 * Non mostra eventi: per la lista completa degli eventi vai su /eventpage.
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../style/HomePageStyle.css'
import heroBg from '../assets/hero-bg.png'

const HOW_IT_WORKS = [
    {
        number: '01',
        icon: 'search-outline',
        title: 'Esplora',
        description: 'Cerca e filtra eventi automotive nella tua zona.',
        to: '/eventpage',
        linkLabel: 'Vai agli eventi',
    },
    {
        number: '02',
        icon: 'heart-outline',
        title: 'Salva',
        description: 'Aggiungi i tuoi eventi preferiti con un click e ritrovali sempre.',
        to: '/favorite',
        linkLabel: 'I miei preferiti',
    },
    {
        number: '03',
        icon: 'add-circle-outline',
        title: 'Crea',
        description: 'Organizza il tuo raduno e condividilo con la community.',
        to: '/createevent',
        linkLabel: 'Crea un evento',
    },
]

export default function HomePage() {
    const [nameUser, setNameUser] = useState(null)

    useEffect(function() {
        const token = localStorage.getItem('token')
        const name = localStorage.getItem('nameUser')
        if (token) setNameUser(name || '')
    }, [])

    const isLoggedIn = nameUser !== null

    return (
        <div id='mainContainer'>

            {/* Hero section */}
            <div className="hero-section">
                <img
                    className="hero-bg"
                    src={heroBg}
                    alt="hero"
                />
                <div className="hero-overlay">
                    <h2>VIVI LA PASSIONE.<br /><em>OGNI STRADA, OGNI EVENTO.</em></h2>
                    <p>Scopri i migliori raduni ed eventi automotive nella tua zona.</p>
                    <Link to="/eventpage" className="hero-cta">Scopri gli eventi</Link>
                </div>
            </div>

            {/* Come funziona */}
            <div className="how-it-works">
                <h2 className="how-title">Come funziona</h2>
                <div className="how-cards-row">
                    {HOW_IT_WORKS.map(function(item) {
                        return (
                            <div className="how-card" key={item.number}>
                                <div className="how-card-number">{item.number}</div>
                                <ion-icon name={item.icon}></ion-icon>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                                <Link to={item.to} className="how-card-link">
                                    {item.linkLabel} →
                                </Link>
                            </div>
                        )
                    })}

                    {/* Card 04 — Registrazione / Benvenuto */}
                    <div className={`how-card how-card-auth${isLoggedIn ? ' how-card-auth--in' : ''}`}>
                        <div className="how-card-number">04</div>
                        <ion-icon name={isLoggedIn ? 'checkmark-circle-outline' : 'person-add-outline'}></ion-icon>
                        {isLoggedIn ? (
                            <>
                                <h3>Bentornato!</h3>
                                {nameUser && <p className="how-card-welcome">Ciao, <strong>{nameUser}</strong> 👋<br />Sei già parte della community.</p>}
                                {!nameUser && <p>Sei già parte della community.</p>}
                                <Link to="/account" className="how-card-link">Il mio account →</Link>
                            </>
                        ) : (
                            <>
                                <h3>Unisciti</h3>
                                <p>Crea un account gratuito per salvare eventi e organizzare i tuoi raduni.</p>
                                <Link to="/registration" className="how-card-link">Registrati →</Link>
                            </>
                        )}
                    </div>

                </div>
            </div>

        </div>
    )
}
