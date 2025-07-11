// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBIcon,
  MDBTypography
} from 'mdb-react-ui-kit';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Caméra en direct',
      icon: 'video',
      path: '/check',
      color: 'linear-gradient(135deg, #c8e1cc, #a8d8b9)',
      textColor: '#2c3e50'
    },
    {
      title: 'Gestion Whitelist',
      icon: 'user-plus',
      path: '/enroll',
      color: 'linear-gradient(135deg, #F5E7E4, #f0d4cf)',
      textColor: '#2c3e50'
    },
    {
      title: 'Historique d\'accès',
      icon: 'history',
      path: '/history',
      color: 'linear-gradient(135deg, #fffafa, #f0f0f0)',
      textColor: '#2c3e50'
    },
  ];

  return (
    <MDBContainer fluid className="p-4">
      {/* En-tête personnalisé */}
      <MDBTypography tag='div' className='text-center mb-4'>
        <h2 className='mb-3' style={{ color: '#4a6b57' }}>
          Bienvenue chez vous!
        </h2>
        <p className='lead' style={{ color: '#7a8c7d' }}>
          Voici votre espace SmartHome AI personnalisé
        </p>
      </MDBTypography>

      <MDBContainer>
        <MDBTypography tag='h3' className='text-center mb-5' style={{ color: '#4a6b57' }}>
          Panneau de Contrôle SmartHome
        </MDBTypography>
        
        <MDBRow className='g-4'>
          {features.map((feature, index) => (
            <MDBCol md='4' sm='6' key={index}>
              <MDBCard 
                onClick={() => navigate(feature.path)} 
                className='h-100 hover-overlay shadow-3-strong'
                style={{ 
                  cursor: 'pointer', 
                  background: feature.color,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
              >
                <MDBCardBody className='text-center d-flex flex-column justify-content-center p-4'>
                  <MDBIcon 
                    fas 
                    icon={feature.icon} 
                    size='3x' 
                    className='mb-3' 
                    style={{ color: feature.textColor }} 
                  />
                  <MDBCardTitle style={{ color: feature.textColor, fontWeight: '500' }}>
                    {feature.title}
                  </MDBCardTitle>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))}
        </MDBRow>
      </MDBContainer>
    </MDBContainer>
  );
};

export default Home;