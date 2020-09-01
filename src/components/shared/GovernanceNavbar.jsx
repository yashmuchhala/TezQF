import React from 'react';

import { Link } from 'react-router-dom';

const GovernanceNavbar = (props) => {
  return (
    <div>
      <nav className='navbar navbar-expand bg-light mb-4'>
        <div className='container'>
          <a className='navbar-brand' href='/'>
            TezQF <span className='lead'>Governance</span>
          </a>
          <div
            style={{
              size: '5',
              color: props.wallet.status === 'connected' ? 'green' : 'red',
            }}
          >
            {props.wallet.status}
          </div>
          <div className='collapse navbar-collapse'>
            <ul className='navbar-nav ml-auto'>
              <li className='nav-item'>
                <Link to='/governance/disputes' className='nav-link'>
                  Disputes
                </Link>
              </li>
              <li className='nav-item'>
                <Link to='/governance/executive' className='nav-link'>
                  Executive
                </Link>
              </li>
              <li className='nav-item'>
                <Link to='#' className='nav-link'>
                  {props.wallet.account}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default GovernanceNavbar;
