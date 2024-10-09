import React, { useState, useEffect, useRef } from 'react';
import AWS from 'aws-sdk'; 
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { SignalingClient, Role } from 'amazon-kinesis-video-streams-webrtc';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../../Header';
import { useAuth } from '../../Hooks/AuthContext';

const StreamVideo = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [output, setOutput] = useState('');
    const [channelARN, setChannelARN] = useState('');
    const remoteVideoRef = useRef(null);  // Reference for the video element

    const userPoolId = 'eu-west-2_9hCbrQq4P'; 
    const clientId = '47ko5gjvt7h5l64c6ej3a22shj'; 
    const identityPoolId = 'eu-west-2:eb767e70-8369-4099-9596-58f5d78cd65c';
    const region = 'eu-west-2'; 

    const poolData = {
        UserPoolId: userPoolId,
        ClientId: clientId
    };
    const userPool = new CognitoUserPool(poolData);

    const authenticateUser = () => {
        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }

        const authenticationData = { Username: username, Password: password };
        const authenticationDetails = new AuthenticationDetails(authenticationData);
        const userData = { Username: username, Pool: userPool };
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: async (result) => {
                console.log('Authentication successful');
                const idToken = result.getIdToken().getJwtToken();

                // Configure AWS SDK
                AWS.config.region = region;
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: identityPoolId,
                    Logins: {
                        [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: idToken
                    }
                });

                // Get temporary credentials
                AWS.config.credentials.get(async (err) => {
                    if (err) {
                        console.error('Error retrieving credentials:', err);
                        setOutput('Error retrieving credentials: ' + err.message);
                        return;
                    }

                    console.log('Temporary credentials obtained:', AWS.config.credentials);
                    const sts = new AWS.STS({ credentials: AWS.config.credentials });
                    const identity = await sts.getCallerIdentity().promise();
                    const userARN = identity.Arn;
                    setOutput(`IAM Role/User ARN: ${userARN}\n`);

                    // Initialize Kinesis Video client
                    const kinesisVideoClient = new AWS.KinesisVideo({ region, credentials: AWS.config.credentials });
                    const describeSignalingChannelResponse = await kinesisVideoClient.describeSignalingChannel({
                        ChannelName: 'dashcam0058'  // Replace with your channel name
                    }).promise();

                    const channelARNValue = describeSignalingChannelResponse.ChannelInfo.ChannelARN;
                    setChannelARN(channelARNValue);
                    setOutput(prev => prev + `Signaling Channel ARN: ${channelARNValue}\n`);

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

                    // Set up the WebRTC viewer
                    setupViewer(channelARNValue, endpointsByProtocol);
                });
            },
            onFailure: (err) => {
                console.error('Authentication failed:', err);
                setOutput('Authentication failed: ' + err.message);
            },
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                alert("Enter a new password.");
                setNewPassword(''); // Reset new password field
            }
        });
    };

    const setupViewer = async (channelARNValue, endpointsByProtocol) => {
        const wssEndpoint = endpointsByProtocol['WSS'];
        if (!wssEndpoint) {
            console.error('WSS endpoint is undefined.');
            return;
        }

        const signalingClient = new SignalingClient({
            channelARN: channelARNValue,
            channelEndpoint: wssEndpoint,
            role: Role.VIEWER,
            region: AWS.config.region,
            clientId: '7Q5W4FRICH', // Use your actual clientId
            credentials: AWS.config.credentials,
        });

        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: ['stun:stun.kinesisvideo.eu-west-2.amazonaws.com:443'] }],
        });

        peerConnection.ontrack = (event) => {
            const mediaStream = event.streams[0];
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = mediaStream; // Attach stream to video element
            }
        };

        signalingClient.on('open', async () => {
            const offer = await peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });
            await peerConnection.setLocalDescription(offer);
            signalingClient.sendSdpOffer(peerConnection.localDescription);
        });

        signalingClient.on('sdpAnswer', async (answer) => {
            await peerConnection.setRemoteDescription(answer);
        });

        signalingClient.on('iceCandidate', (candidate) => {
            peerConnection.addIceCandidate(candidate).catch(error => {
                console.error('Error adding ICE candidate:', error);
            });
        });

        peerConnection.onicecandidate = ({ candidate }) => {
            if (candidate) {
                signalingClient.sendIceCandidate(candidate);
            }
        };

        signalingClient.open();
    };

    return (
        <div>
            <Header />
            <div className="container">
                <h1>AWS Cognito Authenticated Access and Kinesis Video Streams</h1>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="newPassword" id="newPasswordLabel" style={{ display: newPassword ? 'block' : 'none' }}>New Password:</label>
                    <input type="password" id="newPassword" name="newPassword" className="form-control" style={{ display: newPassword ? 'block' : 'none' }} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={authenticateUser}>Login and Get ARNs</button>
                <pre id="output" className="mt-4 fw-bold">{output}</pre>
                <video ref={remoteVideoRef} autoPlay playsInline controls style={{ width: '100%', height: '500px' }} />
            </div>
        </div>
    );
};

export default StreamVideo;
