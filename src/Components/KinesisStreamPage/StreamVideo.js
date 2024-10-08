import React, { useState } from 'react';
import AWS from 'aws-sdk'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
} from 'amazon-cognito-identity-js';
import Header from '../../Header';
import VideoViewer from './VideoViewer'; 
import { useNavigate } from 'react-router-dom';

const userPoolId = 'eu-west-2_9hCbrQq4P'; 
const clientId = '47ko5gjvt7h5l64c6ej3a22shj'; 
const identityPoolId = 'eu-west-2:eb767e70-8369-4099-9596-58f5d78cd65c';
const region = 'eu-west-2'; 


const StreamVideo = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [output, setOutput] = useState('');
    const [channelARN, setChannelARN] = useState(''); // Define channelARN in state
    const [endpointsByProtocol, setEndpointsByProtocol] = useState({}); 
    // const navigation =  useNavigation()
    const navigate = useNavigate()

    const authenticateUser = () => {
        console.log('userName', username,password)
        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }

        const authenticationData = { Username: username, Password: password };
        const authenticationDetails = new AuthenticationDetails(authenticationData);

        console.log('authenticationData',authenticationData)
        console.log('authenticationDetails',authenticationDetails)
        
        const poolData = {
            UserPoolId: userPoolId,
            ClientId: clientId
        };
        console.log('UserPoolId',poolData)
        const userPool = new CognitoUserPool(poolData);
        
        const userData = { Username: username, Pool: userPool };
        const cognitoUser = new CognitoUser(userData);

        console.log('userData',userData)
        console.log('cognitoUser',cognitoUser)

        // Authenticate the user
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                console.log('Authentication successful');
                const idToken = result.getIdToken().getJwtToken();

                // Use the ID token to get AWS credentials from Cognito Identity Pool
                AWS.config.region = region;
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: identityPoolId,
                    Logins: {
                        ['cognito-idp.' + region + '.amazonaws.com/' + userPoolId]: idToken
                    }
                });

                // Retrieve temporary credentials and use them
                AWS.config.credentials.get(async function (err) {
                    console.log(err,'err')
                    if (err) {
                        console.error('Error retrieving credentials:', err);
                        setOutput('Error retrieving credentials: ' + err.message);
                    } else {
                        console.log('Temporary credentials obtained:', AWS.config.credentials);
                        const sts = new AWS.STS({ credentials: AWS.config.credentials });
                        try {
                            const identity = await sts.getCallerIdentity().promise();
                            const userARN = identity.Arn;
                            console.log('IAM Role/User ARN:', userARN);
                            setOutput('IAM Role/User ARN: ' + userARN + '\n');

                            // Initialize Kinesis Video client
                            const kinesisVideoClient = new AWS.KinesisVideo({
                                region: AWS.config.region,
                                credentials: AWS.config.credentials
                            });

                            // Describe the signaling channel to get the ARN
                            const describeSignalingChannelResponse = await kinesisVideoClient.describeSignalingChannel({
                                ChannelName: 'dashcam0058'
                            }).promise();

                            const channelARNValue = describeSignalingChannelResponse.ChannelInfo.ChannelARN;
                            console.log('Signaling Channel ARN:', channelARNValue);
                            setOutput(prev => prev + 'Signaling Channel ARN: ' + channelARNValue);
                            setChannelARN(channelARNValue); 

                            // Get signaling channel endpoints
                            const getSignalingChannelEndpointResponse = await kinesisVideoClient.getSignalingChannelEndpoint({
                                ChannelARN: channelARNValue,
                                SingleMasterChannelEndpointConfiguration: {
                                    Protocols: ['WSS', 'HTTPS'],
                                    Role: 'VIEWER'
                                }
                            }).promise();

                            const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList.reduce((endpoints, endpoint) => {
                                endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
                                return endpoints;
                            }, {});

                            console.log('endpointsByProtocol',endpointsByProtocol)
                            setEndpointsByProtocol(endpointsByProtocol); 

                            navigate('/VideoViewer', { state: { channelARN: channelARN,endpointsByProtocol: endpointsByProtocol } });

                        } catch (error) {
                            console.error('Error:', error);
                            setOutput('Error: ' + error.message);
                        }
                    }
                });
            },
            onFailure: function (err) {
                console.error('Authentication failed:', err);
                setOutput('Authentication failed: ' + err.message);
            },
        });
    };

    return (
        <div>
            <Header />
        <div className="container">      
            <div className='text-center mt-3'>
                <h2 className="text-center text-black">AWS Cognito Authenticated Access</h2>
            </div>
            <div className="d-flex flex-column align-items-center mt-4">
            <div className="mb-3 w-49">
                <input type="text" id="username" name="username"placeholder='Enter UserName' className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
            </div>

            <div className="mb-3 w-49">
                <input type="password" id="password" name="password"placeholder='Enter Password' className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <button className="btn btn-primary" onClick={authenticateUser}>Login</button>
            </div>
            <pre id="output" className="mt-4 fw-bold">{output}</pre>

            {/* Render KinesisVideoViewer only after authentication and ARNs are retrieved */}

            {/* {channelARN && endpointsByProtocol && (
                navigation.navigate(StreamVideo)
            )} */}
        </div>
        </div>
    );
};

export default StreamVideo;