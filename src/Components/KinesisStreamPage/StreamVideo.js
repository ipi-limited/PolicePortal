import React, { useState, useEffect, useRef } from 'react';
import AWS from 'aws-sdk';
import { SignalingClient, Role } from 'amazon-kinesis-video-streams-webrtc';
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import Header from '../../Header';

const StreamVideo = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [output, setOutput] = useState('');
  const [remoteVideoStream, setRemoteVideoStream] = useState(null);
  const [channelARN, setChannelARN] = useState('');
  const [credentials, setCredentials] = useState(null);
  const videoRef = useRef();

  const userPoolId = 'eu-west-2_9hCbrQq4P'; 
  const clientId = '47ko5gjvt7h5l64c6ej3a22shj'; 
  const identityPoolId = 'eu-west-2:eb767e70-8369-4099-9596-58f5d78cd65c'; 
  const region = 'eu-west-2'; 
  const wssEndpoint = 'wss://v-fe304e5e.kinesisvideo.eu-west-2.amazonaws.com';

  useEffect(() => {
    console.log('Entered into use effect')
    if (credentials && channelARN && wssEndpoint) {
      setupViewer(channelARN, credentials, wssEndpoint);
    }
  }, [credentials, channelARN,wssEndpoint]);

  const authenticateUser = () => {
    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }

    const authenticationData = {
      Username: username,
      Password: password,
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const poolData = {
      UserPoolId: userPoolId,
      ClientId: clientId,
    };

    const userPool = new CognitoUserPool(poolData);

    const userData = {
      Username: username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    
    // Authenticate the user
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        console.log('Authentication successful');

        // Get ID token
        const idToken = result.getIdToken().getJwtToken();

        AWS.config.region = region; 
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: identityPoolId,
          Logins: {
            [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: idToken,
          },
        });

        AWS.config.credentials.get(async function (err) {
          if (err) {
            console.error('Error retrieving credentials:', err);
            setOutput(`Error retrieving credentials: ${err.message}`);
          } else {
            console.log('Temporary credentials obtained:', AWS.config.credentials);

            setCredentials(AWS.config.credentials);

            try {
              const sts = new AWS.STS({ credentials: AWS.config.credentials });
              const identity = await sts.getCallerIdentity().promise();
              const userARN = identity.Arn;

              console.log('IAM Role/User ARN:', userARN);
              setOutput(`IAM Role/User ARN: ${userARN}\n`);

              const kinesisVideoClient = new AWS.KinesisVideo({
                region: AWS.config.region,
                credentials: AWS.config.credentials,
              });

              const describeSignalingChannelResponse = await kinesisVideoClient
                .describeSignalingChannel({
                  ChannelName: 'dashcam0058',
                })
                .promise();

              const channelARNValue = describeSignalingChannelResponse.ChannelInfo.ChannelARN;
              console.log('Signaling Channel ARN:', channelARNValue);
              setOutput((prevOutput) => prevOutput + `Signaling Channel ARN: ${channelARNValue}`);
              setChannelARN(channelARNValue);
            } catch (error) {
              console.error('Error:', error);
              setOutput(`Error: ${error.message}`);
            }
          }
        });
      },

      onFailure: (err) => {
        console.error('Authentication failed:', err);
        setOutput(`Authentication failed: ${err.message}`);
      },

      newPasswordRequired: () => {
        console.log('New password required');
        setShowNewPassword(true);
        alert('Enter a new password.');
      },
    });
  };

  const setupViewer = (channelARN, credentials, wssEndpoint) => {
console.log('entered into set up viewer');

    const clientId = '7Q5W4FRICH'; 

    if (!wssEndpoint || !channelARN || !credentials) {
      console.error('Missing required WebRTC setup parameters.');
      return;
    }

    try {
      const signalingClient = new SignalingClient({
        channelARN,
        channelEndpoint: wssEndpoint,
        region: AWS.config.region,
        role: Role.VIEWER,
        clientId,
        credentials,
      });

      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: ['stun:stun.kinesisvideo.eu-west-2.amazonaws.com:443'] }],
      });

      peerConnection.ontrack = (event) => {
        const mediaStream = event.streams[0];
            console.log('Media Stream:', mediaStream);
            console.log('Tracks:', mediaStream.getTracks());
        if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
        } else {
            console.error('Video ref is null. The video element is not rendered yet.');
        }

      };

      signalingClient.on('open', async () => {
        console.log('Signaling client connected');
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        console.log('Sending SDP offer:', offer);
        await peerConnection.setLocalDescription(offer);
        signalingClient.sendSdpOffer(peerConnection.localDescription);
      });

      signalingClient.on('sdpAnswer', async (answer) => {
        console.log('Received SDP answer');
        await peerConnection.setRemoteDescription(answer);
      });

      signalingClient.on('iceCandidate', (candidate) => {
        peerConnection.addIceCandidate(candidate);
      });

      peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
            console.log('Sending ICE candidate:', candidate);
          signalingClient.sendIceCandidate(candidate);
        }
      };

      signalingClient.open();
    } catch (error) {
      console.error('Error initializing SignalingClient:', error.message);
    }
  };

  return (
    <div>
        <Header />
        <div className="container mt-4">
        <h2 className="text-center">Live Streaming</h2>

        <div className="d-flex flex-column align-items-center mt-4">
            <div className="mb-3 w-49">
                <input type="text" id="username" name="username"placeholder='Enter UserName' className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
            </div>

            <div className="mb-3 w-49">
                <input type="password" id="password" name="password"placeholder='Enter Password' className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

      <button className="btn btn-primary mb-3"  onClick={authenticateUser}>Login</button>
    </div>
      {/* <pre>{output}</pre> */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls
        style={{ width: '100%', height: '500px' }}
      ></video>
    </div>
    </div>
  );
};

export default StreamVideo;
