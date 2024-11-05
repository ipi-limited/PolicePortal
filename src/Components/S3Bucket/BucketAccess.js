import React, { useState, useEffect } from 'react';
import { list } from 'aws-amplify/storage';
import { useAuthenticator } from '@aws-amplify/ui-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../../Header';
import { useNavigate } from 'react-router-dom';
import { FaFileVideo, FaFileAlt } from 'react-icons/fa';

const BucketAccess = () => {
  console.log('Bucket Access..!');
    const [s3Data, setS3Data] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const dashcamName = 'dashcam0058';

    const { user } = useAuthenticator((context) => [context.user]);
    const identityId = user.userId;

    useEffect(() => {
      console.log('Fetch S3')
        const fetchS3Data = async () => {
            try {
                const result = await list({
                    path: () => `public/testfile.txt`,                
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
            const videoUrl = await Storage.get(videoKey, { level: 'public' });
            navigate('/VideoPlayer', { state: { videoUrl } });
        } catch (error) {
            console.error('Error retrieving video URL:', error);
            alert('Failed to retrieve video');
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
                        {s3Data.map(item => (
                            <div key={item.key} className="col-md-6 mb-4">
                                <div className="card shadow-sm h-100">
                                    <div className="card-body d-flex align-items-center">
                                        {item.key.endsWith('.mp4') ? (
                                            <FaFileVideo className="me-3 text-primary" size={24} />
                                        ) : (
                                            <FaFileAlt className="me-3 text-secondary" size={24} />
                                        )}
                                        <div className="flex-grow-1">
                                            {item.key.endsWith('.mp4') ? (
                                                <button
                                                    onClick={() => handleVideoClick(item.key)}
                                                    className="btn btn-link p-0 text-dark"
                                                    style={{
                                                        textDecoration: 'none',
                                                        background: 'none',
                                                        whiteSpace: 'nowrap',
                                                        textOverflow: 'ellipsis',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {item.key}
                                                </button>
                                            ) : (
                                                <span>{item.key}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BucketAccess;
