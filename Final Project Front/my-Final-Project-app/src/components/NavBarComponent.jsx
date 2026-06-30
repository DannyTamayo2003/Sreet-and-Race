import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../style/NavBarStyle.css'
import logo from '../assets/ProvaLogo.png'
import userImg from '../assets/userimg.jpg'

export default function NavBarComponent({ menuOpen, setMenuOpen }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const location = useLocation()

  useEffect(function() {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [location])

  const navLinks = [
    { to: '/', label: 'Home', icon: 'home-outline', always: true },
    { to: '/eventpage', label: 'Eventi', icon: 'calendar-outline', always: true },
    { to: '/favorite', label: 'Preferiti', icon: 'heart-outline', protected: true },
    { to: '/contacts', label: 'Contatti', icon: 'mail-outline', always: true },
    { to: isLoggedIn ? '/createevent' : '#', label: 'Crea Evento', icon: 'add-circle-outline', protected: true },
  ]

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link to="/">
            <img src={logo} alt="Logo" className="sidebar-logo-img" />
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map(function(link) {
            const isActive = location.pathname === link.to
            const isDisabled = link.protected && !isLoggedIn
            return (
              <Link
                key={link.to}
                to={isDisabled ? '#' : link.to}
                className={`sidebar-link ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                onClick={function(e) { if (isDisabled) e.preventDefault() }}
              >
                <ion-icon name={link.icon}></ion-icon>
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <Link to={isLoggedIn ? '/account' : '/login'} className="sidebar-user">
            <img src={userImg} alt="User" className="sidebar-user-img" />
            <span>{isLoggedIn ? 'Account' : 'Login'}</span>
          </Link>
          {isLoggedIn && (
            <button
              className="sidebar-logout"
              onClick={function() {
                localStorage.removeItem('token')
                localStorage.removeItem('nameUser')
                window.location.href = '/'
              }}
            >
              <ion-icon name="log-out-outline"></ion-icon>
              <span>Esci</span>
            </button>
          )}
        </div>
      </aside>

      {/* TOP BAR MOBILE */}
      <header className="mobile-header">
        <Link to="/">
          <img src={logo} alt="Logo" className="mobile-logo" />
        </Link>
        <button className="mobile-hamburger" onClick={function() { setMenuOpen(function(o) { return !o }) }}>
          <ion-icon name={menuOpen ? 'close-outline' : 'menu-outline'}></ion-icon>
        </button>
      </header>

      {/* MENU MOBILE OVERLAY */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={function() { setMenuOpen(false) }}>
          <div className="mobile-menu" onClick={function(e) { e.stopPropagation() }}>
            {navLinks.map(function(link) {
              const isDisabled = link.protected && !isLoggedIn
              return (
                <Link
                  key={link.to}
                  to={isDisabled ? '#' : link.to}
                  className={`mobile-menu-link ${isDisabled ? 'disabled' : ''}`}
                  onClick={function(e) {
                    if (isDisabled) { e.preventDefault(); return }
                    setMenuOpen(false)
                  }}
                >
                  <ion-icon name={link.icon}></ion-icon>
                  <span>{link.label}</span>
                </Link>
              )
            })}
            <Link
              to={isLoggedIn ? '/account' : '/login'}
              className="mobile-menu-link"
              onClick={function() { setMenuOpen(false) }}
            >
              <ion-icon name="person-outline"></ion-icon>
              <span>{isLoggedIn ? 'Account' : 'Login'}</span>
            </Link>
            {isLoggedIn && (
              <button className="mobile-menu-link mobile-logout" onClick={function() {
                localStorage.removeItem('token')
                localStorage.removeItem('nameUser')
                setMenuOpen(false)
                window.location.href = '/'
              }}>
                <ion-icon name="log-out-outline"></ion-icon>
                <span>Esci</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
