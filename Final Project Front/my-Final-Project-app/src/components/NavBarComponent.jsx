/*
 * NavBarComponent.jsx — Barra di navigazione principale
 * Sempre visibile in cima alla pagina. Adatta i link in base allo stato di login:
 * - Se loggato: mostra Account e abilita Favorite e Create Event
 * - Se non loggato: mostra Login e disabilita le sezioni protette
 * Gestisce anche il toggle del menu mobile (Navbar.Toggle).
 */

import React, { useState, useEffect } from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import '../style/NavBarStyle.css'
import logo from '../assets/ProvaLogo.png'
import userImg from '../assets/userimg.jpg'

export default function NavBarComponent({ menuOpen, setMenuOpen }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(function() {
    // Controlla se esiste un token in localStorage per determinare lo stato di login
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token) // !! converte il valore in booleano (true se esiste, false se null)
  }, [])

  return (
    <Navbar expand="lg" className="bg-body-tertiary fixed-top">
      <Container id="navbarContainer" fluid>

        {/* Logo — cliccabile, reindirizza alla home */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center logoContainer">
          <img id='Logo' src={logo} alt="ProvaLogo" />
        </Navbar.Brand>

        {/* Pulsante hamburger visibile su mobile */}
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={function() { setMenuOpen(function(open) { return !open }) }}
        />

        <Navbar.Collapse id="basic-navbar-nav" className={menuOpen ? "show" : ""}>
          <Nav className="linkContainer">
            <Nav.Link as={Link} to="/" className="nav-link-red">Home</Nav.Link>
            <Nav.Link as={Link} to="/contacts" className="nav-link-red">Contacts</Nav.Link>

            {/* Favorite: disabilitato se l'utente non è loggato */}
            <Nav.Link
              as={Link}
              to="/favorite"
              className={`navLinkOrange ${!isLoggedIn ? "disabled-link" : ""}`}
              onClick={function(e) { if (!isLoggedIn) e.preventDefault() }}
            >
              Favorite
            </Nav.Link>

            {/* Su mobile: mostra Account o Login in base allo stato di login */}
            {isLoggedIn ? (
              <Nav.Link as={Link} to="/account" className="nav-link-red d-lg-none navLinkLogin">Account</Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/login" className="nav-link-red d-lg-none navLinkLogin">Login</Nav.Link>
            )}

            {/* Create Event: disabilitato se l'utente non è loggato */}
            <Nav.Link
              as={Link}
              to={isLoggedIn ? "/createevent" : "#"}
              className={`nav-link-red navLinkCreateEvent ${!isLoggedIn ? "disabled-link" : ""}`}
              onClick={function(e) { if (!isLoggedIn) e.preventDefault() }}
            >
              Create Event
            </Nav.Link>
          </Nav>

          {/* Su desktop: icona utente che porta ad Account o Login */}
          <div className="loginUser d-none d-lg-flex">
            <Link to={isLoggedIn ? "/account" : "/login"}>
              <img
                src={userImg}
                alt="User Icon"
                className="user-icon-img"
                id="userImg"
                style={{ cursor: 'pointer' }}
              />
            </Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
