import React from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import Header from '../../Header'

const libraries = ['places'];
const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};
const center = {
  lat: 52.9540, // default latitude
  lng: -1.1550, // default longitude
};

const Dashboard = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDRMqUF1M3QUCEEfTlnXhlbK1CeG3dd0Uc',
    libraries,
  });

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (
    <div>
    <Header />
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={center}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
    </div>
  );
};

export default Dashboard;
