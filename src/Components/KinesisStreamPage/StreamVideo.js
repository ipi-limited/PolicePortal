import React, { useState, useEffect, useRef } from 'react';
import AWS from 'aws-sdk';
import { SignalingClient, Role } from 'amazon-kinesis-video-streams-webrtc';
import Header from '../../Header';
import { useLocation } from 'react-router-dom';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import awsExports from '../../aws-exports'

const StreamVideo = () => {
  const [output, setOutput] = useState('');
  const [channelARN, setChannelARN] = useState('');
  const [credentials, setCredentials] = useState({});
  const [wssEndPoint, setWssEndPoint] = useState('');
  const [response, setResponse] = useState('');
  const [isReady, setIsReady] = useState(false); 
  const videoRef = useRef();
  const location = useLocation();
  let peerConnection;
  let signalingClient;
  const dashCamName = location.state?.record; 
  console.log('DashCam Name',dashCamName)
  const region = awsExports.aws_project_region;

  useEffect(() => {
    async function initializeStream() {
      console.log('Initializing stream...');
      await authenticateUser();
      if (credentials && channelARN && wssEndPoint) {
        setIsReady(true); 
      }
    }
    initializeStream();
  }, [credentials, channelARN, wssEndPoint]);

  useEffect(() => {
    if (isReady) {
      setupViewer(channelARN, credentials, wssEndPoint);
    }
  }, [isReady]);


   // Send command function
   const sendCommand = async (command) => {
    const apiUrl = 'https://v2hvllmzbk.execute-api.eu-west-2.amazonaws.com/dev/send-command';

    const payload = {
      command: command,
    };

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(`Command '${command}' sent successfully`);
        console.log(`Command '${command}' sent successfully`);
      } else {
        setResponse(`Error: ${data}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('Failed to send command');
    }
  };

  useEffect(() => {
    const handleRouteChange = () => {
      console.log('Route changed to:', location.pathname);

      if (location.pathname === '/StreamVideo') {
        authenticateUser();
        sendCommand('start');
        console.log('Start Command Sent');
        setupViewer(channelARN, credentials, wssEndPoint);
      } else {
        sendCommand('stop');
        console.log('Stop Command Sent');
        stopViewer();
      }
    };
    handleRouteChange();
    console.log('User navigated to:', location.pathname);
  }, [location]);


  const authenticateUser = async() => {
            console.log('Authenticating user...');
            try {
              const authSession = await fetchAuthSession();
              const credentials = authSession.credentials;

              setCredentials(credentials);
              const sts = new AWS.STS({ credentials });
              const identity = await sts.getCallerIdentity().promise();
              const userARN = identity.Arn;

              console.log('IAM Role/User ARN:', userARN);
              setOutput(`IAM Role/User ARN: ${userARN}\n`);

              const kinesisVideoClient = new AWS.KinesisVideo({
                region,
                credentials ,
              });

              const describeSignalingChannelResponse = await kinesisVideoClient
                .describeSignalingChannel({
                  ChannelName: dashCamName,
                })
                .promise();

              const channelARNValue = describeSignalingChannelResponse.ChannelInfo.ChannelARN;
              console.log('Signaling Channel ARN:', channelARNValue);
              setOutput((prevOutput) => prevOutput + `Signaling Channel ARN: ${channelARNValue}`);
              setChannelARN(channelARNValue);
                // Get the WSS endpoint using getSignalingChannelEndpoint
                  const getSignalingChannelEndpointResponse = await kinesisVideoClient
                  .getSignalingChannelEndpoint({
                    ChannelARN: channelARNValue,
                    SingleMasterChannelEndpointConfiguration: {
                      Protocols: ['WSS'],
                      Role: 'VIEWER',
                    },
                  })
                  .promise();

                // Extract the WSS endpoint
                const wssEndPointValue = getSignalingChannelEndpointResponse.ResourceEndpointList.find(
                  endpoint => endpoint.Protocol === 'WSS'
                ).ResourceEndpoint;

                console.log('WSS Endpoint:', wssEndPointValue);
                setWssEndPoint(wssEndPointValue); 
            } catch (error) {
              console.error('Error:', error);
              setOutput(`Error: ${error.message}`); 
            }
          }

  const setupViewer = (channelARN, credentials, wssEndPoint) => {
  console.log('entered into set up viewer',channelARN,credentials,wssEndPoint);
    const clientId = '7Q5W4FRICH'; 

    if (!wssEndPoint || !channelARN || !credentials) {
      console.error('Missing required WebRTC setup parameters.');
      return;
    }

    try {
        signalingClient = new SignalingClient({
        channelARN,
        channelEndpoint: wssEndPoint,
        region,
        role: Role.VIEWER,
        clientId, 
        credentials,
      });

        peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: ['stun:stun.kinesisvideo.eu-west-2.amazonaws.com:443'] }],
      });

      peerConnection.ontrack = (event) => {
        const mediaStream = event.streams[0];
            console.log('Media Stream:', mediaStream);
            console.log('Tracks:', mediaStream.getTracks());
        if (videoRef.current) {
            videoRef.current.srcObject =  mediaStream;
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

  const stopViewer = () => {
    if (peerConnection) {
      // Close the media tracks
      peerConnection.getSenders().forEach(sender => {
        if (sender.track) {
          sender.track.stop();
        }
      });
  
      // Close the peer connection
      peerConnection.close();
      // peerConnection=null;
      console.log('PeerConnection closed');
    }
  
    // Close the signaling client
    if (signalingClient) {
      signalingClient.close();
      console.log('Signaling client closed');
    }
  
    // Clear the video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  
  const handleVisibilityChange = () => {
    console.log('Entered into visibility change');
    if (document.visibilityState === 'visible') {
      authenticateUser();
      sendCommand('start');
      console.log('Start Command Sent');
      setupViewer(channelARN, credentials, wssEndPoint);
    } else {
      sendCommand('stop');
      console.log('Stop Command Sent');
      stopViewer();
    }
  };

  useEffect(() => {
    console.log('Enter into use effect');
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sendCommand('stop'); 
      console.log('Stop command send')
      stopViewer(); 
    };
  }, []);



  return (
    <div>
        <Header />
        <div className="container mt-4">
        <h2 className="text-center mb-4">Live Streaming</h2>

        {/* <div className="d-flex flex-row align-items-center justify-content-center mt-4">
          <button
            className="btn btn-primary mb-3"
            onClick={() => {
              authenticateUser();
              sendCommand('start'); 
            }}
          >
            Start
          </button>
          <button
            className="btn btn-primary mb-3 ms-3"
            onClick={() => {
              sendCommand('stop');
              stopViewer(); 
            }}
          >
            Stop
          </button>
        </div> */}

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
