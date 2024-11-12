    import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
    import { Button } from 'react-bootstrap';
    import Header from '../../Header';
    import AWS from 'aws-sdk';
    import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
    import { FaUpload } from 'react-icons/fa';
    import MapTraces from '../../Hooks/MapTraces';
    import { generateClient } from 'aws-amplify/api';
    import { listDemoTables } from '../../graphql/queries'; 
    import {createDemoTable} from '../../graphql/mutations';
 
    const DbTable = () => {

        const [searchParams, setSearchParams] = useState({
            postcode: '',
            numberPlate:'',
            latitude: '',
            longitude: '',
            startTime: '',
            endTime: '',
            radius: '',
        });

        const [records, setRecords] = useState([]);
        const [filteredRecords, setFilteredRecords] = useState([]); 
        const [loading, setLoading] = useState(true);
        const [boundingCoords, setBoundingCoords] = useState({
            latitude_min: null,
            latitude_max: null,
            longitude_min: null,
            longitude_max: null,
        });
        const [isMapRender, setIsMapRender] = useState(false);
        const [selectedRecords, setSelectedRecords] = useState(new Set()); 
        const [mapCoordinates, setMapCoordinates] = useState([]);

        const mapRef = useRef(null);  

        useLayoutEffect(() => {
            if (mapCoordinates.length > 0 && mapRef.current) {
                mapRef.current.scrollIntoView({ behavior: 'smooth' });
                setIsMapRender(true);
            }
        }, [mapCoordinates]); 

        useEffect(() => {
            const fetchRecords = async () => {
                try {
                    const client = await generateClient();
                    const { data } = await client.graphql({ query: listDemoTables });
                    console.log('Fetched Data:', data);
                    setRecords(data.listDemoTables.items || []);
                } catch (errors) {
                    console.error('Error fetching data from AppSync:', errors);
                    alert(`Error fetching records: ${errors.message}`);
                } finally {
                    setLoading(false);
                }
            };
    
            fetchRecords();
        }, []); 

        useEffect(() => {
            console.log('Records:', records);
        }, [records]);
    
        const calculateBoundingBox = (lat, long, radiusInMiles) => {
            const latRadius = radiusInMiles / 69.0; // Rough conversion from miles to degrees
            const longRadius = radiusInMiles / (69.172 * Math.abs(lat));

            return {
                latMin: parseFloat((lat - latRadius).toFixed(6)),
                latMax: parseFloat((lat + latRadius).toFixed(6)),
                longMin: parseFloat((long - longRadius).toFixed(6)),
                longMax: parseFloat((long + longRadius).toFixed(6)),
            };        
        };

        const handleSearch = (e) => {
            console.log('seatch pressed')
            e.preventDefault();

            const lat = parseFloat(searchParams.latitude);
            const long = parseFloat(searchParams.longitude);

            if ((searchParams.latitude && isNaN(lat)) || (searchParams.longitude && isNaN(long))) {
                alert("Please enter valid latitude and longitude values.");
                return;
            }

            const formattedStartTime = searchParams.startTime ? formatDateToString(searchParams.startTime) : null;
            const formattedEndTime = searchParams.endTime ? formatDateToString(searchParams.endTime) : null;

            // Filter records based on search criteria
            const filtered = records.filter((record) => {
                let matches = true;
        
                // Check for postcode match (case-insensitive)
                if (searchParams.postcode) {
                    if (record.postcode) {
                        matches &= record.postcode.toLowerCase().includes(searchParams.postcode.toLowerCase());
                    } else {
                        matches = false;
                    }
                }

                if (searchParams.numberPlate) {
                    if (record.number_plate) {
                        matches &= record.number_plate.toLowerCase().includes(searchParams.numberPlate.toLowerCase());
                    } else {
                        matches = false;
                    }
                }
        
                // Check for latitude and longitude within bounding box
                if (searchParams.latitude && searchParams.longitude) {
                    const { latMin, latMax, longMin, longMax } = calculateBoundingBox(
                        parseFloat(searchParams.latitude),
                        parseFloat(searchParams.longitude),
                        searchParams.radius
                    );
                    console.log('lat',latMin,latMax,longMin,longMax)
                    const latMinStr = latMin.toString();
                    const latMaxStr = latMax.toString();
                    const longMinStr = longMin.toString();
                    const longMaxStr = longMax.toString();
        
                    matches &= (record.latitude.toString() >= latMinStr && record.latitude.toString() <= latMaxStr ||
                                record.longitude.toString() >= longMinStr && record.longitude.toString() <= longMaxStr);
                    console.log('Match result for record:',  matches);
        
                }
        
                if (formattedStartTime && formattedEndTime) {
                    matches &= (record.video_start_time >= formattedStartTime && record.video_end_time <= formattedEndTime);
                }
        
    
    
                return matches;
    
            });
        
            setFilteredRecords(filtered);
            setSearchParams({
                postcode: '',
                numberPlate: '',
                latitude: '',
                longitude: '',
                startTime: '',
                endTime: '',
                radius: '' ,
            });
        
        };


        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setSearchParams((prevParams) => ({
                ...prevParams,
                [name]: value,
            }));
        };

        const formatDateToString = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
        
            return `${year}${month}${day}_${hours}${minutes}`;
        };
        
        const handleFileChange = async (record) => {
            console.log('record',record)
            
                const command = 'upload';
        
                const requestBody = {
                    command,
                    file_name: record.video_file_name,
                    file_path: record.file_location
                };
                console.log('requestBody',requestBody)
                try {
                    const response = await fetch('https://q3f7b9mv99.execute-api.eu-west-2.amazonaws.com/dev/commands', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestBody)
                    });
        
                    const data = await response.json();
                    console.log('data',data)
                    if (response.ok) {
                        alert(`Upload command sent successfully for ${record.dashcam_name}.`);
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Failed to send upload command');
                }
            };

            const handleRowSelection = (selectedRows) => {
                const coordinates = selectedRows.map(row => {
                    const lat = parseFloat(row.latitude);
                    const lng = parseFloat(row.longitude);
            
                    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                        return {
                            id: row.video_file_name,
                            lat,
                            lng,
                            timestamp: row.video_end_time 
                        };
                    } else {
                        console.error('Invalid coordinates for record:', row);
                        return null;
                    }
                }).filter(coord => coord !== null);
            
                if (coordinates.length === 0) {
                    console.warn('No valid coordinates selected.');
                } else {
                    setMapCoordinates(coordinates);
                }
                console.log('Selected coordinates Roe Selection:', mapCoordinates);
            };
            
            
        
            const handleCheckboxChange = (record) => {
                setSelectedRecords((prevSelectedRecords) => {
                    const updatedSelection = new Set(prevSelectedRecords);
                    if (updatedSelection.has(record)) {
                        updatedSelection.delete(record);
                    } else {
                        updatedSelection.add(record);
                    }
                    const selectedRows = Array.from(updatedSelection);
                    handleRowSelection(selectedRows);
        
                    return updatedSelection;

                });            
            };
        
            const handleShowMap = () => {
                const selectedCoordinates = Array.from(selectedRecords).map(record => {
                    const lat = parseFloat(record.latitude);
                    const lng = parseFloat(record.longitude);
                    const id = record.video_file_name;
                    const timestamp = record.video_end_time;
            
                    if (isNaN(lat) || isNaN(lng)) {
                        console.error('Invalid lat/lng:', lat, lng);
                        return null; 
                    }
            
                    return { lat, lng, id, timestamp };
                }).filter(coord => coord !== null); 
                console.log('Selected coordinates for map:', selectedCoordinates);
                if (selectedCoordinates.length > 0) {
                    setMapCoordinates(selectedCoordinates);
                    if (mapRef.current) {
                        mapRef.current.scrollIntoView({ behavior: 'smooth' });
                    } 
                } 
                else {
                    console.warn('No coordinates to show on the map.');
                }
                 
            };
        console.log('Map ',mapCoordinates);
        return (
            <div>
            <Header />
            <div className="container-fluid mt-2" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                <h2 className="text-center">Search Records</h2>
                <div style={{ margin: '5px', display: 'flex', justifyContent: 'space-between', gap:'5px' }}>
                <input
                    type="text"
                    name="postcode"
                    placeholder="Postcode"
                    value={searchParams.postcode}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="numberPlate"
                    placeholder="Number Plate"
                    value={searchParams.numberPlate}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="latitude"
                    placeholder="Latitude"
                    value={searchParams.latitude}
                    onChange={handleInputChange}
                    onPaste={(e) => {
                        const pastedData = e.clipboardData.getData('Text');
                        const [lat, long] = pastedData.split(',').map(coord => coord.trim());
                        setSearchParams((prevParams) => ({
                            ...prevParams,
                            latitude: lat,
                            longitude: long 
                        }));
                        e.preventDefault(); 
                    }}
                
                />
                <input
                    type="text"
                    name="longitude"
                    placeholder="Longitude"
                    value={searchParams.longitude}
                    onChange={handleInputChange}
                />
                <select
              name="radius"
              value={searchParams.radius}
              onChange={handleInputChange}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((radiusValue) => (
                <option key={radiusValue} value={radiusValue}>
                  {radiusValue} mile{radiusValue > 1 ? 's' : ''}
                </option>
              ))}
            </select>
                <input
                    type="datetime-local"
                    name="startTime"
                    placeholder="Start Time"
                    value={searchParams.startTime}
                    onChange={handleInputChange}
                />
                <input
                    type="datetime-local"
                    name="endTime"
                    placeholder="End Time"
                    value={searchParams.endTime}
                    onChange={handleInputChange}
                />
                <Button className="btn btn-primary" onClick={handleSearch}>
                    Search
                </Button>
                </div>
                <div className='text-center mt-2'>
                {selectedRecords.size > 0 && (
                    <Button onClick={handleShowMap} className="btn btn-secondary">
                        Show on Map
                    </Button>
                    )}
                </div>
                {loading ? (
                <p>Loading...</p>
                ) : (
                <table className="table">
                    <thead>
                    <tr>
                        <th>Select</th>
                        <th style={{ wordWrap: 'break-word', maxWidth: '150px' }}>Video File Name</th>
                        <th style={{ wordWrap: 'break-word', maxWidth: '150px' }}>Dashcam Name</th>
                        <th style={{ wordWrap: 'break-word', maxWidth: '150px' }}>File Location</th>
                        <th style={{ wordWrap: 'break-word', maxWidth: '150px' }}>Number Plate</th>
                        <th style={{ wordWrap: 'break-word', maxWidth: '150px' }}>Latitude</th>
                        <th style={{ wordWrap: 'break-word', maxWidth: '150px' }}>Longitude</th>
                        <th style={{ wordWrap: 'break-word', maxWidth: '150px' }}>Postcode</th>
                        <th style={{ wordWrap: 'break-word', maxWidth: '150px' }}>Video Start Time</th>
                        <th style={{ wordWrap: 'break-word', maxWidth: '150px' }}>Video End Time</th>
                        <th style={{ wordWrap: 'break-word', maxWidth: '150px' }}>Video Upload</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((record, index) => (
                        <tr key={index}>
                             <td>
                                <input 
                                type="checkbox" 
                                style={{ width: '20px', height: '20px', marginTop:'20px' }} 
                                checked={selectedRecords.has(record)} 
                                onChange={() => handleCheckboxChange(record)} 
                                />
                            </td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{record.video_file_name}</td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{record.dashcam_name}</td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{record.file_location}</td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{record.number_plate}</td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{record.latitude}</td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{record.longitude}</td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{record.postcode}</td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{record.video_start_time}</td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{record.video_end_time}</td>
                            <td  style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                <FaUpload 
                                onClick={() => handleFileChange(record)}
                                style={{ cursor: 'pointer' }}
                                />
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                        <td colSpan="9">No records found</td>
                        </tr>
                    )}
                    </tbody>
                </table>
                )}
            </div>
            {mapCoordinates.length > 0 && <MapTraces ref={mapRef} Coordinates={mapCoordinates} />}
            </div>
        );
        };


    export default DbTable;
