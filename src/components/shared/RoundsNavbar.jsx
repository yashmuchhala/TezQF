import React from 'react';

import { Link } from 'react-router-dom';

const RoundsNavbar = (props) => {
  return (
    <div>
      <nav className='navbar navbar-expand bg-light mb-4'>
        <div className='container'>
          <a className='navbar-brand' href='/'>
            TezQF <span className='lead'>Rounds</span>
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
                <Link to='/rounds/contribute' className='nav-link'>
                  Contribute
                </Link>
              </li>
              <li className='nav-item'>
                <Link to='/rounds/sponsor' className='nav-link'>
                  Sponsor
                </Link>
              </li>
              <li className='nav-item'>
                <Link to='/rounds/archive' className='nav-link'>
                  Archive
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

export default RoundsNavbar;
