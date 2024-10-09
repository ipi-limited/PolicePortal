import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import Header from '../../Header'; 
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';

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

  const identityPoolId = 'eu-west-2:eb767e70-8369-4099-9596-58f5d78cd65c';
const region = 'eu-west-2';
// const bucketName = 'Customer-dashcam-videos';
const folderName = 'dashcam0058/';
const userPoolId = 'eu-west-2_9hCbrQq4P';
const dashcamName = 'dashcam0058/';

  useEffect(() => {
    // Check if saved credentials exist
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
          region: 'eu-west-2', // Change to your S3 bucket region
          credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'eu-west-2:eb767e70-8369-4099-9596-58f5d78cd65c', // Your Identity Pool ID
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

  return (
    <div>
            <Header />
            <h2>S3 Bucket Contents</h2>
            <h3>API Result</h3>
            <pre>{apiResult ? JSON.stringify(apiResult, null, 2) : 'No result yet'}</pre>
            {s3Data && (
                <div>
                    <h4>S3 Data</h4>
                    <ul>
                        {s3Data.map(item => (
                            <li key={item.Key}>{item.Key}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
  );
};


export default BucketAccess;
