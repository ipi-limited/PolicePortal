
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import StreamVideo from '../Components/KinesisStreamPage/StreamVideo';
import VideoViewer from '../Components/KinesisStreamPage/VideoViewer';
import BucketAccess from '../Components/S3Bucket/BucketAccess';
import Dashboard from '../Components/DashBoardPage/Dashboard';
import Login from '../Components/LoginPage';
import { useAuth } from '../Hooks/AuthContext';
import VideoPlayer from '../Components/S3Bucket/VideoPlayer';
import DbTable from '../Components/Database/DbTable';
import useIdleTimer  from '../Hooks/useIdleTimer';

const AppRoutes = () => {
    const { isAuthenticated, loading } = useAuth(); 
    useIdleTimer(5 * 60 * 1000); 
    if (loading) {
        return <div>Loading...</div>;
      }

    return (
        <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/StreamVideo" element={<StreamVideo/>} />
            <Route path="/VideoViewer" element={<VideoViewer/>} />
            <Route path="/BucketAccess" element={<BucketAccess/>} />
            <Route path="/Dashboard" element={<Dashboard/>} />
            {/* <Route path="/SendCommand" element={<SendCommand/>} /> */}
            <Route path="/VideoPlayer" element={<VideoPlayer/>} />
            <Route path="/DbTable" element={<DbTable/>} />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;
