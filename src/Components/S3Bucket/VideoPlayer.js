// VideoPlayer.js
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../Header';

const VideoPlayer = () => {
    const location = useLocation();
    const videoRef = useRef(null);
    const { videoLink } = location.state || {};

    console.log('videoLink',videoLink)

    useEffect(() => {
        if (videoRef.current && videoLink) {
            videoRef.current.src = videoLink;
            videoRef.current.play().catch(error => {
                console.error('Error playing video:', error);
            });
        }
    }, [videoLink]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = videoLink;
        link.download = videoLink.split('/').pop(); // Extract filename from URL
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
             <Header />
            <div className='container'>
            <h2 className='text-center'>Video Player</h2>
            {videoLink ? (
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
