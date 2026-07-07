import React from 'react';
import { Terminal } from 'lucide-react';
import './Header.css';

export default function Header() {
  return (
    <header className="header glass-panel">
      <div className="header-content app-container">
        <div className="logo-section">
          <Terminal className="logo-icon" size={28} />
          <h1 className="logo-text">Code<span className="gradient-text">Sage</span> AI</h1>
        </div>
        <nav className="nav-links">
          <a href="#">Documentation</a>
          <a href="#">GitHub</a>
        </nav>
      </div>
    </header>
  );
}
