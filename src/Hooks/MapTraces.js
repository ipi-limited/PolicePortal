import React, {forwardRef, useState, useEffect} from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100vw',
  height: '70vh',
};

const carMarkerIcon = 'static/images/MapMarker.png'


  const MapTraces = forwardRef(({Coordinates},ref) => {
    console.log('Coords',Coordinates)
  const [renderMap, setRenderMap] = useState(false); 

  // useEffect(() => {
  //   if (Coordinates.length > 0 && ref.current) {
  //     console.log('enter into useeffect',Coordinates.length)

  //     ref.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [Coordinates, ref.current]);

  
  const center = {
    lat: Coordinates.length > 0 ? Coordinates[0].lat : 55.183179, 
    lng: Coordinates.length > 0 ? Coordinates[0].lng : -4.24801, 
  };

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
    <div ref={ref}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
        options={{ disableDefaultUI: true, zoomControl: true }}
      >
      {Coordinates.length > 0 &&
       Coordinates.map(record => (
                        <Marker
                            key={record.id}
                            position={{ lat: record.lat, lng: record.lng }}
                            title={record.timestamp} 
                            icon={{
                              url: carMarkerIcon,
                              scaledSize: new window.google.maps.Size(60, 60),
                          }}
                        />
                    ))}
      </GoogleMap>
    </div>
  );
})  ;

export default MapTraces;
