import React, { useEffect, useState } from 'react';
// import mqtt from 'mqtt'; // Import MQTT library
import Header from '../../Header';
import { Button } from 'react-bootstrap';
import AWS from 'aws-sdk';
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'eu-west-2_9hCbrQq4P',
    ClientId: '47ko5gjvt7h5l64c6ej3a22shj'
};

const userPool = new CognitoUserPool(poolData);

const DbTable = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    // const dashCamName = 'dashcam0058';
    const [searchParams, setSearchParams] = useState({  
        dashCamName: '',
        postcode: '',
        latitude: '',
        longitude: '',
    });

    const [apiResult, setApiResult] = useState('');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        const savedPassword = localStorage.getItem('password');
        if (savedUsername && savedPassword) {
            setUsername(savedUsername);
            setPassword(savedPassword);
            signIn(savedUsername, savedPassword); 
        }
    }, []);

    const signIn = async (user, pass) => {
        console.log('SignIn', user,pass)
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

        localStorage.setItem('cognitoUser',cognitoUser);
        
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: async (result) => {
                const idToken = result.getIdToken().getJwtToken();
                // alert('Login Successful');
                fetchDashCams(idToken);
    },
    onFailure: (err) => {
        alert(err.message || JSON.stringify(err));
    },
});
};

const buildQueryString = (params) => {
    let queryString = '';

    // Append each parameter if it exists
    if (params.dashCamName) queryString += `dashcam_name=${encodeURIComponent(params.dashCamName)}&`;
    if (params.postcode) queryString += `postcode=${encodeURIComponent(params.postcode)}&`;
    if (params.latitude && !isNaN(params.latitude)) queryString += `latitude=${encodeURIComponent(params.latitude)}&`;
    if (params.longitude && !isNaN(params.longitude)) queryString += `longitude=${encodeURIComponent(params.longitude)}&`;

    // Remove the trailing '&' if it exists
    if (queryString.endsWith('&')) {
        queryString = queryString.slice(0, -1);
    }

    return queryString;
};

    const fetchDashCams = async(idToken) => {

        const params = {
            dashCamName: searchParams.dashCamName,
            postcode: searchParams.postcode,
            latitude: searchParams.latitude,
            longitude: searchParams.longitude,
        };

        const queryString = buildQueryString(params);
        const apiUrl = queryString ? `https://07qk57lfa2.execute-api.eu-west-2.amazonaws.com/dev/dashcams?${queryString}` : `https://07qk57lfa2.execute-api.eu-west-2.amazonaws.com/dev/dashcams`;

        console.log('Fetching API with URL:', apiUrl);

        setLoading(true);
        setError(null);
        console.log('Fetching API with URL:', apiUrl); 
        try {
            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: idToken,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Result', data);
            const parsedData = JSON.parse(data.body); 
            setApiResult(parsedData);
        } catch (error) {
            console.error('Error fetching API:', error);
            alert('Failed to call API');
        }
        finally {
            setLoading(false);
        }
    };

    console.log('API result', apiResult)

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams((prevParams) => ({
            ...prevParams,
            [name]: value,
        }));
    };

    const handleSearchAndFetch = async () => {
        const savedUsername = localStorage.getItem('username');
        const savedPassword = localStorage.getItem('password');

        if (savedUsername && savedPassword) {
            try {
                await signIn(savedUsername, savedPassword);
            } catch (error) {
                console.error('Authentication failed:', error);
            }
        }

    };


    // const handleSearchChange = (e) => {
    //     const { name, value } = e.target;
    //     setSearchParams((prevParams) => ({
    //         ...prevParams,
    //         [name]: value,
    //     }));
    // };

    // const handlePlayVideo = (videoFileName, fileLocation) => {
    //     const mqttClient = mqtt.connect('mqtt://your-broker-url'); // Replace with your MQTT broker URL

    //     const message = {
    //         command: 'upload',
    //         file_name: videoFileName,
    //         file_path: fileLocation,
    //     };

    //     mqttClient.on('connect', () => {
    //         mqttClient.publish('your/topic', JSON.stringify(message), {}, (err) => {
    //             if (err) {
    //                 console.error('Failed to send MQTT message:', err);
    //             } else {
    //                 console.log('MQTT message sent:', message);
    //             }
    //             mqttClient.end();
    //         });
    //     });
    // };

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
                        name="dashCamName"
                        placeholder="DashCam Name"
                        value={searchParams.dashCamName} 
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
                    <Button className="btn btn-primary" title='Search' onClick={handleSearchAndFetch}>Search</Button>
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
                        {Array.isArray(apiResult) && apiResult.length > 0 ? (
                            apiResult.map((dashcam) => (
                                <tr key={dashcam.video_file_name}>
                                    <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{dashcam.video_file_name}</td>
                                    <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{dashcam.dashcam_name}</td>
                                    <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{dashcam.file_location}</td>
                                    <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{dashcam.ip_address}</td>
                                    <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{dashcam.Latitude}</td>
                                    <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{dashcam.longitude}</td>
                                    <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{dashcam.postcode}</td>
                                    <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{dashcam.video_start_time}</td>
                                    <td style={{ wordWrap: 'break-word', maxWidth: '150px' }}>{dashcam.video_end_time}</td>
                                    <td>
                                        <button onClick={() => {}}>
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
