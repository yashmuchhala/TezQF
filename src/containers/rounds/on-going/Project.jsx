import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { dummyProjects } from '../../../data/dummyProjects';

const Project = () => {
  const { id } = useParams();
  // State to maintain active tab
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className='container-fluid'>
      {/* Header */}
      <div className='row'>
        {/* Project Image */}
        <div className='col-4'>
          <img
            src={dummyProjects[id - 1].image}
            height='250px'
            width='300px'
            alt='Project Background'
          />
        </div>
        {/* Project Overview */}
        <div className='col-4'>
          <h1 className='font-weight-light'>{dummyProjects[id - 1].title}</h1>
          <h3 className='font-weight-light'>{dummyProjects[id - 1].pitch}</h3>
          <ul class='list-group list-group-flush'>
            <li class='list-group-item'>{dummyProjects[id - 1].website}</li>
            <li class='list-group-item'>{dummyProjects[id - 1].github}</li>
            <li class='list-group-item'>{dummyProjects[id - 1].address}</li>
          </ul>
        </div>
        {/* Project funding */}
        <div className='col-4 d-flex flex-column align-items-center justify-content-center'>
          <h1 className='font-weight-light'>
            {dummyProjects[id - 1].amount} tz
          </h1>
          <p>Received from a total of 180 contributors</p>
          <button className='btn btn-primary btn-block'>Contribute</button>
          <p className='align-self-end'>! Dispute</p>
        </div>
      </div>

      <hr />

      {/* Tab Navigation for description, contributors and comments */}
      <ul className='nav nav-tabs'>
        <li className='nav-item'>
          <a
            href='#description'
            className={`nav-link ${activeTab === 0 ? `active` : null}`}
            onClick={() => setActiveTab(0)}
          >
            Description
          </a>
        </li>
        <li className='nav-item'>
          <a
            href='#contributors'
            className={`nav-link ${activeTab === 1 ? `active` : null}`}
            onClick={() => setActiveTab(1)}
          >
            Contributors
          </a>
        </li>
        <li className='nav-item'>
          <a
            href='#comments'
            className={`nav-link ${activeTab === 2 ? `active` : null}`}
            onClick={() => setActiveTab(2)}
          >
            Comments
          </a>
        </li>
      </ul>

      {/* Tab content */}
      <div className='tab-content container mt-3'>
        <div
          className={`tab-pane ${activeTab === 0 ? `active` : null}`}
          id='description'
        >
          Description
        </div>
        <div
          className={`tab-pane ${activeTab === 1 ? `active` : null}`}
          id='description'
        >
          Contributions
        </div>
        <div
          className={`tab-pane ${activeTab === 2 ? `active` : null}`}
          id='description'
        >
          Comments
        </div>
      </div>
    </div>
  );
};

export default Project;
