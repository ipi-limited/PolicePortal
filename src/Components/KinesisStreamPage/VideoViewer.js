import React, { useEffect } from 'react';
import AWS from 'aws-sdk';
import { SignalingClient, Role } from 'amazon-kinesis-video-streams-webrtc';
import { useLocation } from 'react-router-dom';
import Header from '../../Header';

const VideoViewer = () => {

    const location = useLocation();
    const { channelARN, endpointsByProtocol } = location.state || {};

    useEffect(() => {
        console.log('Received channelARN:', channelARN);
        console.log('Received endpointsByProtocol:', endpointsByProtocol);

        if (!endpointsByProtocol || Object.keys(endpointsByProtocol).length === 0) {
            console.error('EndPoints by Protocol are not yet defined.');
            return;
        }

        const setupViewer = async () => {
            const wssEndpoint = endpointsByProtocol['WSS'];
            if (!wssEndpoint) {
                console.error('WSS endpoint is undefined.');
                return;
            }

            try {
                const signalingClient = new SignalingClient({
                    channelARN: channelARN,
                    channelEndpoint: wssEndpoint,
                    role: Role.VIEWER,
                    region: AWS.config.region,
                    clientId: '7Q5W4FRICH',
                    credentials: AWS.config.credentials,
                });

                const peerConnection = new RTCPeerConnection({
                    iceServers: [{ urls: ['stun:stun.kinesisvideo.eu-west-2.amazonaws.com:443'] }],
                });

                peerConnection.ontrack = event => {
                    const mediaStream = event.streams[0];
                    document.getElementById('remoteVideo').srcObject = mediaStream;
                };

                signalingClient.on('open', async () => {
                    const offer = await peerConnection.createOffer({
                        offerToReceiveAudio: true,
                        offerToReceiveVideo: true,
                    });
                    await peerConnection.setLocalDescription(offer);
                    signalingClient.sendSdpOffer(peerConnection.localDescription);
                });

                signalingClient.on('sdpAnswer', async answer => {
                    await peerConnection.setRemoteDescription(answer);
                });

                signalingClient.on('iceCandidate', candidate => {
                    peerConnection.addIceCandidate(candidate);
                });

                peerConnection.onicecandidate = ({ candidate }) => {
                    if (candidate) {
                        signalingClient.sendIceCandidate(candidate);
                    }
                };

                signalingClient.open();
            } catch (error) {
                console.error('Error initializing SignalingClient:', error.message);
            }
        };

        setupViewer();
    }, [channelARN, endpointsByProtocol]);

    return (
        <div>
            <Header />
        <div className="container">      
            <div className='text-center mt-3'>
                <h2 className="text-center text-black">Video Stream Viewer</h2>
            </div>
            <video id="remoteVideo" autoPlay playsInline controls style={{ width: '100%', height: '500px' }}></video>
        </div>
        </div>
    );
};

export default VideoViewer;
