// VideoPlayer.js
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../Header';

const VideoPlayer = () => {
    const location = useLocation();
    const videoRef = useRef(null);
    const { videoUrl } = location.state || {};

    useEffect(() => {
        if (videoRef.current && videoUrl) {
            // Use WebRTC to stream video if you have a signaling server
            // For now, just set the source to the video URL
            videoRef.current.src = videoUrl;
            videoRef.current.play().catch(error => {
                console.error('Error playing video:', error);
            });
        }
    }, [videoUrl]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = videoUrl.split('/').pop(); // Extract filename from URL
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
             <Header />
            <div className='container'>
            <h2 className='text-center'>Video Player</h2>
            {videoUrl ? (
                <video ref={videoRef} controls style={{ width: '100%', height: '500px' }} />
            ) : (
                <p>No video URL provided.</p>
            )}
            <button onClick={handleDownload}>Download Video</button>
        </div>
        </div>
    );
};

export default VideoPlayer;
