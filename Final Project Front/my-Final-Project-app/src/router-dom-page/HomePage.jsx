/*
 * HomePage.jsx — Landing Page
 * Pagina principale dell'app, pensata come vetrina del brand "Street & Race".
 * Non mostra eventi: per la lista completa degli eventi vai su /eventpage.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import FeaturedCardComponent from '../components/FeaturedCardComponent'
import '../style/HomePageStyle.css'

export default function HomePage() {
    return (
        <div id='mainContainer'>
            <h1>STREET AND RACE</h1>

            {/* Sezione hero con immagine in evidenza */}
            <div id='mainEventCard' className="event-flex-row">
                <div className="featured-col">
                    <div id="titleFeaturedEvent">
                        <h2>In evidenza</h2>
                    </div>
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
