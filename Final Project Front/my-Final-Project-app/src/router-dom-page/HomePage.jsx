/*
 * HomePage.jsx — Landing Page
 * Pagina principale dell'app, pensata come vetrina del brand "Street & Race".
 * Non mostra eventi: per la lista completa degli eventi vai su /eventpage.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import FeaturedCardComponent from '../components/FeaturedCardComponent'
import '../style/HomePageStyle.css'
import heroBg from '../assets/hero-bg.png'

export default function HomePage() {
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

            {/* Sezione eventi in evidenza */}
            <div id='titleFeaturedEvent'>
                <h2>In Evidenza</h2>
            </div>
            <div id='mainEventCard' className="event-flex-row">
                <div className="featured-col">
                    <FeaturedCardComponent />
                </div>
            </div>

            {/* Icone di navigazione rapida */}
            <div id='iconContainer'>
                <div className='containerIconText'>
                    <Link to="/eventpage" className="icon-link">
                        <ion-icon name="calendar-outline" class="icon"></ion-icon>
                    </Link>
                    <h6><span>1.</span> Scopri gli eventi</h6>
                </div>
                <div className='containerIconText'>
                    <ion-icon name="share-social-sharp" class="icon"></ion-icon>
                    <h6><span>2.</span> Condividi</h6>
                </div>
            </div>
        </div>
    )
}
