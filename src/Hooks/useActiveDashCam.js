import { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'eu-west-2_9hCbrQq4P',
    ClientId: '47ko5gjvt7h5l64c6ej3a22shj',
};

const userPool = new CognitoUserPool(poolData);


 const useActiveDashcam = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true); 
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        const savedPassword = localStorage.getItem('password');
        if (savedUsername && savedPassword) {
            signIn(savedUsername, savedPassword);
        }
    }, []);

    const signIn = async (user, pass) => {
        const authenticationData = {
            Username: user,
            Password: pass,
        };

        const authenticationDetails = new AuthenticationDetails(authenticationData);
        const userData = {
            Username: user,
            Pool: userPool,
        };
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: async (result) => {
                const idToken = result.getIdToken().getJwtToken();
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: 'eu-west-2:eb767e70-8369-4099-9596-58f5d78cd65c',
                    Logins: {
                        [`cognito-idp.eu-west-2.amazonaws.com/${poolData.UserPoolId}`]: idToken,
                    },
                });

                AWS.config.credentials.get((err) => {
                    if (err) {console.error('Error getting AWS credentials:', err);
                    }
                    else{
                        fetchRecordsFromDynamoDB();
                    }
                });                
            },
            onFailure: (err) => {
                alert(err.message || JSON.stringify(err));
            },
        });
    };

    const formatToComparableString = (timestamp) => {
        const date = new Date(timestamp);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}${month}${day}_${hours}${minutes}${seconds}`; // Format as YYYYMMDD_HHMMSS
    };
    
    
    const fetchRecordsFromDynamoDB = async () => {
        const dynamoDB = new AWS.DynamoDB.DocumentClient();
        const params = {
          TableName: 'demo-table',
          FilterExpression: '#ts >= :time',
          ExpressionAttributeNames: {
            '#ts': 'video_end_time',
          },
          ExpressionAttributeValues: {
            ':time': formatToComparableString(fiveMinutesAgo), //'20241023_113531'
          },
        };
        console.log('Params',params);
        try {
          const result = await dynamoDB.scan(params).promise();
          console.log('Fetched Records:', result.Items);
          const transformedRecords = result.Items.map(item => ({
            id: item.video_file_name,
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
            timestamp: item.video_end_time, 
          }));

          setRecords(transformedRecords); 
          setLoading(false);
        } catch (error) {
          console.error('Error fetching records from DynamoDB:', error);
          alert(`Error fetching records: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };  
      console.log('results',records) ;

      return { records, loading };

}

export default useActiveDashcam;
