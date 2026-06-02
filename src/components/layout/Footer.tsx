import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            CodeForGlory
          </Link>
          <p className="footer-tagline">
            Gamifying the future of software engineering.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-link-group">
            <p className="footer-link-group-title">Platform</p>
            <Link to="/courses" className="footer-link">
              Courses
            </Link>
            <Link to="/battle" className="footer-link">
              Arena
            </Link>
            <Link to="/pricing" className="footer-link">
              Pricing
            </Link>
          </div>

          <div className="footer-link-group">
            <p className="footer-link-group-title">Community</p>
            <a
              href="https://discord.gg/"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              Discord
            </a>
            <Link to="/events" className="footer-link">
              Events
            </Link>
            <Link to="/guilds" className="footer-link">
              Guilds
            </Link>
          </div>
        </div>

        {/* ── Social Icons ── */}
        <div className="footer-socials">
          <a href="#share" className="footer-social-btn" aria-label="Share">
            <span className="material-symbols-outlined">share</span>
          </a>

          <a
            href="#feedback"
            className="footer-social-btn"
            aria-label="Feedback"
          >
            <span className="material-symbols-outlined">chat_bubble</span>
          </a>

          <a
            href="#language"
            className="footer-social-btn"
            aria-label="Language"
          >
            <span className="material-symbols-outlined">language</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
