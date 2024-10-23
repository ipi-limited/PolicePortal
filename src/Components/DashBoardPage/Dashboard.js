import React from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import Header from '../../Header'
import useActiveDashcam from '../../Hooks/useActiveDashCam';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};
const center = {
  lat: 52.9540,
  lng: -1.1550, 
};
const carMarkerIcon = '/Images/CarPin.png'
const Dashboard = () => {
  const { records, loading } = useActiveDashcam();
console.log('Records from DB', records)


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

  const handleRightClick = (event) => {
    const lat = event.latLng.lat().toFixed(6);
    const lng = event.latLng.lng().toFixed(6);
    const Coordinates = `${lat}, ${lng}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(Coordinates)
      .then(() => {
        alert(`Coordinates copied to clipboard:  ${Coordinates}`);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };


  return (
    <div>
    <Header />
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={center}
        onRightClick={handleRightClick} 
      >
       {records.map(record => (
                        <Marker
                            key={record.id}
                            position={{ lat: record.latitude, lng: record.longitude }}
                            title={record.timestamp} 
                            icon={{
                              url: carMarkerIcon,
                              scaledSize: new window.google.maps.Size(50, 50),
                          }}
                        />
                    ))}
      </GoogleMap>
    </div>
    </div>
  );
};

export default Dashboard;
