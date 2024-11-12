import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listDemoTables } from '../graphql/queries';

const useActiveDashcam = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

  const formatToComparableString = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  };

  const fetchRecordsFromDynamoDB = async () => {
    setLoading(true); // Set loading to true at the start of the fetch
    try {
      const client = await generateClient();
      const { data } = await client.graphql({ query: listDemoTables });
      console.log('Fetched Records:', data.listDemoTables.items);

      const transformedRecords = data.listDemoTables.items.map((item) => ({
        id: item.video_file_name,
        dashcam_name: item.dashcam_name,
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
        timestamp: item.video_end_time,
      }));

      setRecords(transformedRecords);
    } catch (error) {
      console.error('Error fetching records from DynamoDB:', error);
      alert(`Error fetching records: ${error.message}`);
    } finally {
      setLoading(false); // Set loading to false after fetching is complete
    }
  };

  useEffect(() => {
    fetchRecordsFromDynamoDB();
  }, []);

  return { records, loading };
};

export default useActiveDashcam;
