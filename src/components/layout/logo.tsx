import myLogo from '../../../public/component_2_2x.png';
import './logo.css';

export default function Logo() {
  return (
    <div className="auth-logo-section" aria-hidden="true">
      <img src={myLogo} alt="Logo" />
    </div>
  );
}
