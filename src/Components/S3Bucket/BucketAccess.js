import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import Header from '../../Header'; 
import { useNavigate } from 'react-router-dom';
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import { FaFileVideo, FaFileAlt } from 'react-icons/fa'; 

const poolData = {
    UserPoolId: 'eu-west-2_9hCbrQq4P',
    ClientId: '47ko5gjvt7h5l64c6ej3a22shj' 
  };
  
  const userPool = new CognitoUserPool(poolData);
  

const BucketAccess = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [apiResult, setApiResult] = useState(null);
    const [s3Data, setS3Data] = useState(null);
    const navigate = useNavigate();
    const dashcamName = 'dashcam0058/';

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
        // alert('Login successful!');

        // Call the API Gateway endpoint with the Cognito token and dashcam name
        const queryString = `dashcam_name=${dashcamName}`;
        const apiUrl = `https://07qk57lfa2.execute-api.eu-west-2.amazonaws.com/dev/dashcams?${queryString}`;

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
          console.log('API data:', data); 
          setApiResult(data);
        } catch (error) {
          console.error('Error fetching API:', error);
          alert('Failed to call API');
        }
        console.log('data',apiResult)
        // Initialize AWS SDK for S3
        AWS.config.update({
          region: 'eu-west-2',
          credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'eu-west-2:eb767e70-8369-4099-9596-58f5d78cd65c',
            Logins: {
              [`cognito-idp.eu-west-2.amazonaws.com/${poolData.UserPoolId}`]: idToken
            }
          })
        });

        const s3 = new AWS.S3();
        
        const params = {
            Bucket: 'customer-dashcam-videos',
            MaxKeys: 10,
          };
  

        // Fetch objects from S3 bucket
        try {
          const s3Response = await s3.listObjectsV2(params).promise();
          setS3Data(s3Response.Contents);
        } catch (error) {
          console.error('Error fetching S3 data:', error);
          alert('Failed to fetch S3 data');
        }
      },

      onFailure: (err) => {
        alert(err.message || JSON.stringify(err));
      }
    });
  };

  const handleVideoClick = (videoKey) => {
    // Construct the S3 video URL
    console.log('videoKey',videoKey)
    const videoUrl = `https://customer-dashcam-videos.s3.eu-west-2.amazonaws.com/${videoKey}`;
    navigate('/VideoPlayer', { state: { videoUrl } });
};


  return (
    <div>
            <Header />
            <div className="container mt-4">
                <h2 className="text-center">DashCam Records</h2>
                {s3Data && (
                    <div className="row">
                        {s3Data.map(item => (
                            <div key={item.Key} className="col-md-6 mb-4">
                                <div className="card shadow-sm h-100">
                                    <div className="card-body d-flex align-items-center">
                                        {/* Check if the file is an mp4, if so, make it a clickable button */}
                                        {item.Key.endsWith('.mp4') ? (
                                            <FaFileVideo className="me-3 text-primary" size={24} />
                                        ) : (
                                            <FaFileAlt className="me-3 text-secondary" size={24} />
                                        )}
                                        <div className="flex-grow-1">
                                            {item.Key.endsWith('.mp4') ? (
                                                <button
                                                    onClick={() => handleVideoClick(item.Key)}
                                                    className="btn btn-link p-0 text-dark"
                                                    style={{ textDecoration: 'none',background:'none',whiteSpace: 'nowrap',
                                                      textOverflow: 'ellipsis', cursor: 'pointer' }}
                                                >
                                                    {item.Key}
                                                </button>
                                            ) : (
                                                <span>{item.Key}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

  );
};


export default BucketAccess;
