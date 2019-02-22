import { Link } from 'gatsby';
import React from 'react';
import logo from '../images/logo.png';

const Header = ({ title }) => (
  <header className="site-header">
    <div className="container">
      <div className="site-header-inner">
        <div className="brand header-brand">
          <h1 className="m-0">
            <Link className="header-link" to="/">
              <img className="header-logo" src={logo} alt="logo" />
              <span className="header-main">
                MakerAds
                {title ? <span className="lead-title">{title}</span> : null}
              </span>
            </Link>
          </h1>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
