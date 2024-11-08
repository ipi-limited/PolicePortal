
import React, {useState,useEffect} from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StreamVideo from '../Components/KinesisStreamPage/StreamVideo';
import VideoViewer from '../Components/KinesisStreamPage/VideoViewer';
import BucketAccess from '../Components/S3Bucket/BucketAccess';
import Dashboard from '../Components/DashBoardPage/Dashboard';
import Login from '../Components/LoginPage';
import VideoPlayer from '../Components/S3Bucket/VideoPlayer';
import DbTable from '../Components/Database/DbTable';
import useIdleTimer  from '../Hooks/useIdleTimer';
// import { useAuthenticator } from '@aws-amplify/ui-react';

const AppRoutes = () => {
    const { user } = 'user1';
    // console.log('user',user)
    useIdleTimer(5 * 60 * 1000); 

    return (
        <Routes>
            {user ? (
                <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/StreamVideo" element={<StreamVideo/>} />
                <Route path="/VideoViewer" element={<VideoViewer/>} />
                <Route path="/BucketAccess" element={<BucketAccess/>} />
                <Route path="/Dashboard" element={<Dashboard/>} />
                <Route path="/VideoPlayer" element={<VideoPlayer/>} />
                <Route path="/DbTable" element={<DbTable/>} />
                <Route path="*" element={<Navigate to="/" />} />
                </>
            ): (
                <Route path="/" element={ <Login />} />
            )}
            
            
        </Routes>
    );
};

export default AppRoutes;
