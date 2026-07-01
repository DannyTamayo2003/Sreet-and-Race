/*
 * HomePage.jsx — Landing Page
 * Pagina principale dell'app, pensata come vetrina del brand "Street & Race".
 * Non mostra eventi: per la lista completa degli eventi vai su /eventpage.
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../style/HomePageStyle.css'
import heroBg from '../assets/hero-bg.png'
import gearImg from '../assets/gear-bg.png'
import mapImg from '../assets/map-italy-bg.png'
import heartImg from '../assets/heart-bg.png'
import communityImg from '../assets/community-bg.png'

const HOW_IT_WORKS = [
    {
        number: '01',
        icon: 'search-outline',
        title: 'Esplora',
        description: 'Pensata per trovare eventi in tutta Italia: cerca quello più vicino a te.',
        bg: mapImg,
    },
    {
        number: '02',
        icon: 'heart-outline',
        title: 'Salva',
        description: 'Aggiungi i tuoi eventi preferiti con un click, prima che scadano o non siano più disponibili.',
        bg: heartImg,
    },
    {
        number: '03',
        icon: 'add-circle-outline',
        title: 'Crea',
        description: 'Organizza il tuo evento e condividilo con la community.',
        bg: gearImg,
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
                    <p>Dalla pista alla strada, connettiti con gli appassionati della tua zona. Organizza, crea e scopri eventi. Sei tu a dar vita a questa passione.</p>
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
                                {item.bg && (
                                    <div className="how-card-bg" style={{ backgroundImage: `url(${item.bg})` }} />
                                )}
                                <div className="how-card-overlay">
                                    <ion-icon name={item.icon} class="how-icon"></ion-icon>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        )
                    })}

                    {/* Card 04 — Registrazione / Benvenuto */}
                    <div className={`how-card how-card-auth${isLoggedIn ? ' how-card-auth--in' : ''}`}>
                        <div className="how-card-bg" style={{ backgroundImage: `url(${communityImg})` }} />
                        <div className="how-card-overlay">
                            <ion-icon
                                name={isLoggedIn ? 'checkmark-circle-outline' : 'person-add-outline'}
                                class={`how-icon${isLoggedIn ? ' how-icon-green' : ''}`}
                            ></ion-icon>
                            {isLoggedIn ? (
                                <>
                                    <h3>Bentornato!</h3>
                                    {nameUser && <p className="how-card-welcome">Ciao, <strong>{nameUser}</strong> 👋<br />Sei già parte della community.</p>}
                                    {!nameUser && <p>Sei già parte della community.</p>}
                                </>
                            ) : (
                                <>
                                    <h3>Unisciti</h3>
                                    <p>Crea un account gratuito per salvare eventi e organizzare i tuoi raduni.</p>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}
