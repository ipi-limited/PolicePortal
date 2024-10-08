
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '../App';
import StreamVideo from '../Components/KinesisStreamPage/StreamVideo';
import VideoViewer from '../Components/KinesisStreamPage/VideoViewer';
const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/StreamVideo" element={<StreamVideo/>} />
            <Route path="/VideoViewer" element={<VideoViewer/>} />
        </Routes>
    );
};

export default AppRoutes;
