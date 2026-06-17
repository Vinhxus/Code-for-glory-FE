import { Link } from 'react-router-dom';
import './Footer.css';
import { useT } from '../../i18n/useT';

export default function Footer() {
  const t = useT();
  const labels =
    t('footer.platform') === 'Nền tảng'
      ? {
          share: 'Chia sẻ',
          feedback: 'Phản hồi',
          language: 'Ngôn ngữ',
        }
      : {
          share: 'Share',
          feedback: 'Feedback',
          language: 'Language',
        };
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            CodeForGlory
          </Link>
          <p className="footer-tagline">{t('footer.tagline')}</p>
        </div>

        <div className="footer-links">
          <div className="footer-link-group">
            <p className="footer-link-group-title">{t('footer.platform')}</p>
            <Link to="/courses" className="footer-link">
              {t('footer.courses')}
            </Link>
            <Link to="/battle" className="footer-link">
              {t('footer.arena')}
            </Link>
            <Link to="/pricing" className="footer-link">
              {t('footer.pricing')}
            </Link>
          </div>

          <div className="footer-link-group">
            <p className="footer-link-group-title">{t('footer.community')}</p>
            <a
              href="https://discord.gg/"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              {t('footer.discord')}
            </a>
            <Link to="/events" className="footer-link">
              {t('footer.events')}
            </Link>
            <Link to="/guilds" className="footer-link">
              {t('footer.guilds')}
            </Link>
          </div>
        </div>

        {/* ── Social Icons ── */}
        <div className="footer-socials">
          <a
            href="#share"
            className="footer-social-btn"
            aria-label={labels.share}
          >
            <span className="material-symbols-outlined">share</span>
          </a>

          <a
            href="#feedback"
            className="footer-social-btn"
            aria-label={labels.feedback}
          >
            <span className="material-symbols-outlined">chat_bubble</span>
          </a>

          <a
            href="#language"
            className="footer-social-btn"
            aria-label={labels.language}
          >
            <span className="material-symbols-outlined">language</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
