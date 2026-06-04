import { Link } from 'react-router-dom';
import logo from '../../assets/logo/petdate-logo.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';

function AuthNavbar() {
  return (
    <nav className="navbar fixed-top petdate-nav petdate-nav--solid">
      <div className="container-fluid px-4 d-flex align-items-center justify-content-center">
        <Link to="/" className="d-flex align-items-center gap-3 text-decoration-none">
          <img
            src={logo}
            alt="PetDate"
            className="brand-logo"
            style={{ width: '48px', height: '48px', objectFit: 'contain' }}
          />
          <span className="brand-text">PetDate</span>
        </Link>
      </div>
    </nav>
  );
}

export default AuthNavbar;