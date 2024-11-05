import React, { useState, useEffect } from 'react';
import { list, getProperties } from 'aws-amplify/storage';
import { useAuthenticator } from '@aws-amplify/ui-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../../Header';
import { useNavigate } from 'react-router-dom';
import { FaFileVideo, FaFileAlt } from 'react-icons/fa';

const BucketAccess = () => {
    const [s3Data, setS3Data] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const dashcamName = 'dashcam0058/';

    const { user } = useAuthenticator((context) => [context.user]);
    const identityId = user.userId;

    useEffect(() => {
        const fetchS3Data = async () => {
            try {
                const result = await list({
                    path: () => dashcamName,                
                  });                
                const items = result?.items || [];
                setS3Data(items);
                console.log('Result',result.items)
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching S3 data:', error);
                alert('Failed to fetch S3 data');
                setS3Data([]); 
                setIsLoading(false);
            }
        };
        fetchS3Data();
    }, []);

    const handleVideoClick = async (videoKey) => {
        try {
            const result = await getProperties({
              path: videoKey,
            });
            console.log('File Properties ', result);
          } catch (error) {
            console.log('Error ', error);
          }
          
    };
    return (
<div>
            <Header />
            <div className="container mt-4">
                <h2 className="text-center">DashCam Records</h2>
                {isLoading ? (
                    <div className="text-center mt-4">Loading DashCam Records...</div>
                ) : s3Data.length === 0 ? (
                    <div className="text-center mt-4">No records found.</div>
                ) : (
                    <div className="row">
                        {s3Data.map(item => {
                            if (!item || !item.path) {
                                console.warn('Item without path:', item);
                                return null; 
                            }

                            return (
                                <div key={item.path} className="col-md-6 mb-4">
                                    <div className="card shadow-sm h-100">
                                        <div className="card-body d-flex align-items-center">
                                            {item.path.endsWith('.mp4') ? (
                                                <FaFileVideo className="me-3 text-primary" size={24} />
                                            ) : (
                                                <FaFileAlt className="me-3 text-secondary" size={24} />
                                            )}
                                            <div className="flex-grow-1">
                                                {item.path.endsWith('.mp4') ? (
                                                    <button
                                                        onClick={() => handleVideoClick(item.path)}
                                                        className="btn btn-link p-0 text-dark"
                                                        style={{
                                                            textDecoration: 'none',
                                                            background: 'none',
                                                            whiteSpace: 'wrap',
                                                            textOverflow: 'ellipsis',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        {item.path}
                                                    </button>
                                                ) : (
                                                    <span>{item.path}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>

    );
};

export default BucketAccess;
