// src/awsConfig.js
import AWS from 'aws-sdk'; 
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
} from 'amazon-cognito-identity-js';

// AWS Configuration
const userPoolId = 'eu-west-2_9hCbrQq4P'; 
const clientId = '47ko5gjvt7h5l64c6ej3a22shj'; 
const identityPoolId = 'eu-west-2:eb767e70-8369-4099-9596-58f5d78cd65c';
const region = 'eu-west-2'; 

// Initialize the Cognito User Pool
const poolData = {
    UserPoolId: userPoolId,
    ClientId: clientId,
};
const userPool = new CognitoUserPool(poolData);

// Function to authenticate user and return AWS credentials
export const authenticateUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const authenticationData = { Username: username, Password: password };
        const authenticationDetails = new AuthenticationDetails(authenticationData);
        const userData = { Username: username, Pool: userPool };
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                const idToken = result.getIdToken().getJwtToken();

                // Use the ID token to get AWS credentials from Cognito Identity Pool
                AWS.config.region = region;
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: identityPoolId,
                    Logins: {
                        [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: idToken,
                    },
                });

                // Retrieve temporary credentials
                AWS.config.credentials.get((err) => {
                    if (err) {
                        reject('Error retrieving credentials: ' + err.message);
                    } else {
                        resolve(AWS.config.credentials);
                    }
                });
            },
            onFailure: (err) => {
                reject('Authentication failed: ' + err.message);
            },
        });
    });
};
