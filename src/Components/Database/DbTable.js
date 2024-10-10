import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt'; // Import MQTT library
import Header from '../../Header';
import { Button } from 'react-bootstrap';
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'eu-west-2_9hCbrQq4P',
    ClientId: '47ko5gjvt7h5l64c6ej3a22shj'
};

const userPool = new CognitoUserPool(poolData);

const DbTable = () => {
    const [dashcams, setDashcams] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const dashcamName = 'dashcam0058/';
    const [apiResult, setApiResult] = useState([]);
    const [searchParams, setSearchParams] = useState({
        deviceName: '',
        latitude: '',
        longitude: '',
        postcode: '',
    });
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        const savedPassword = localStorage.getItem('password');
        if (savedUsername && savedPassword) {
            setUsername(savedUsername);
            setPassword(savedPassword);
            signIn(savedUsername, savedPassword); // Automatically sign in
        }
    }, []);

    const signIn = async (user, pass) => {
        const authenticationData = {
            Username: user,
            Password: pass || password
        };

        const authenticationDetails = new AuthenticationDetails(authenticationData);
        const userData = {
            Username: user,
            Pool: userPool
        };
        const cognitoUser = new CognitoUser(userData);  

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: async (result) => {
                const idToken = result.getIdToken().getJwtToken();
            },
            onFailure: (err) => {
                setError(err.message || JSON.stringify(err));
            }
        });
    };

    const fetchDashcams = async (idToken) => {
        const queryString = `dashcam_name=${dashcamName}`;
        const apiUrl = `https://07qk57lfa2.execute-api.eu-west-2.amazonaws.com/dev/dashcams?${queryString}`;
    
        // console.log('APIURL',apiUrl)
        setLoading(true); // Set loading state to true
        try {
            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: idToken,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('API response:', data); // Log the entire response for inspection
    
            // Assuming the response should have a body that's a JSON string
            if (data.body) {
                try {
                    const parsedData = JSON.parse(data.body); // Parse the body
                    console.log('Parsed data:', parsedData); // Log parsed data
    
                    if (Array.isArray(parsedData)) {
                        setDashcams(parsedData);
                    } else {
                        console.error('Expected an array but received:', parsedData);
                        setDashcams([]); // Reset to empty array if not an array
                    }
                } catch (parseError) {
                    console.error('Error parsing data body:', parseError);
                    setDashcams([]); // Reset to empty array on parse error
                }
            } else {
                console.error('Response does not contain a body:', data);
                setDashcams([]);
            }
        } catch (error) {
            console.error('Error fetching API:', error);
            setError('Failed to call API');
            setDashcams([]); // Reset to empty array on error
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };
    
    
    

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams((prevParams) => ({
            ...prevParams,
            [name]: value,
        }));
    };

    const handlePlayVideo = (videoFileName, fileLocation) => {
        const mqttClient = mqtt.connect('mqtt://your-broker-url'); // Replace with your MQTT broker URL

        const message = {
            command: 'upload',
            file_name: videoFileName,
            file_path: fileLocation,
        };

        mqttClient.on('connect', () => {
            mqttClient.publish('your/topic', JSON.stringify(message), {}, (err) => {
                if (err) {
                    console.error('Failed to send MQTT message:', err);
                } else {
                    console.log('MQTT message sent:', message);
                }
                mqttClient.end();
            });
        });
    };

    return (
        <div>
            <Header />
            <div className="container mt-4">
                <h2 className="text-center">Data Base Search</h2>
                {error && <p>Error: {error}</p>}
                {loading && <p>Loading...</p>} {/* Show loading state */}

                {/* Search Form */}
                <div style={{ margin: '5px', display: 'flex', justifyContent: 'space-between' }}>
                    <input
                        type="text"
                        name="deviceName"
                        placeholder="Device Name"
                        value={searchParams.deviceName} 
                        onChange={handleSearchChange}
                    />
                    <input
                        type="text"
                        name="latitude"
                        placeholder="Latitude"
                        value={searchParams.latitude}
                        onChange={handleSearchChange}
                    />
                    <input
                        type="text"
                        name="longitude"
                        placeholder="Longitude"
                        value={searchParams.longitude}
                        onChange={handleSearchChange}
                    />
                    <input
                        type="text"
                        name="postcode"
                        placeholder="Postcode"
                        value={searchParams.postcode}
                        onChange={handleSearchChange}
                    />
                    <Button className="btn btn-primary" title='Search'>Search</Button>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>Video File Name</th>
                            <th>Dashcam Name</th>
                            <th>File Location</th>
                            <th>IP Address</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>Postcode</th>
                            <th>Video Start Time</th>
                            <th>Video End Time</th>
                            <th>Action</th> {/* New Action Column */}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(dashcams) && dashcams.length > 0 ? (
                            dashcams.map((dashcam) => (
                                <tr key={dashcam.video_file_name}>
                                    <td>{dashcam.video_file_name}</td>
                                    <td>{dashcam.dashcam_name}</td>
                                    <td>{dashcam.file_location}</td>
                                    <td>{dashcam.ip_address}</td>
                                    <td>{dashcam.Latitude}</td>
                                    <td>{dashcam.longitude}</td>
                                    <td>{dashcam.postcode}</td>
                                    <td>{dashcam.video_start_time}</td>
                                    <td>{dashcam.video_end_time}</td>
                                    <td>
                                        <button onClick={() => handlePlayVideo(dashcam.video_file_name, dashcam.file_location)}>
                                            Play Video
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10">No dashcams found.</td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default DbTable;
