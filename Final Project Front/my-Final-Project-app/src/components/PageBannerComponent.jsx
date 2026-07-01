import React from 'react'
import '../style/PageBannerStyle.css'

export default function PageBannerComponent({ title, subtitle }) {
  return (
    <div className="page-banner">
      <h1 className="page-banner-title">{title}</h1>
      <p className="page-banner-sub">{subtitle}</p>
    </div>
  )
}
