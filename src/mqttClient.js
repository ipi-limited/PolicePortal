// // src/mqttClient.js
// import AWS from 'aws-sdk';
// import mqtt from 'mqtt';

// const AWS_REGION = 'eu-west-2';
// const IOT_ENDPOINT = 'a6d4zjxu915di-ats.iot.eu-west-2.amazonaws.com'; 
// const IDENTITY_POOL_ID = 'eu-west-2:17cc1e37-16c8-4bf6-b006-65519b14c8eb';

// export const getCognitoCredentials = async () => {
//   // Configure AWS region and credentials
//   AWS.config.region = AWS_REGION;
//   AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//     IdentityPoolId: IDENTITY_POOL_ID, 
//   });

//   // Fetch the credentials
//   await AWS.config.credentials.getPromise();
//   return AWS.config.credentials;
// };

// // Function to connect to AWS IoT via MQTT over WebSocket
// export const connectMQTT = async () => {
//     const credentials = await getCognitoCredentials();
  
//     const options = {
//       protocol: 'wss',
//       accessKeyId: credentials.accessKeyId,
//       secretKey: credentials.secretAccessKey,
//       sessionToken: credentials.sessionToken,
//       clientId: 'mqttClient_' + Math.random().toString(36).substring(7),
//       username: AWS.config.credentials.identityId,
//       host: IOT_ENDPOINT,
//     };
  
//     const mqttClient = mqtt.connect(`wss://${IOT_ENDPOINT}/mqtt`, options);

//     console.log('`wss://${IOT_ENDPOINT}/mqtt`')

//     // const mqttClient = mqtt.connect('ws://broker.hivemq.com:8000/mqtt');
  
//     console.log('MQTTClient screen',mqttClient)

//     mqttClient.on('connect', () => {
//       console.log('Connected to AWS IoT Core');
//       mqttClient.subscribe('/dashcam0058/remoteactions/', (err) => {
//         if (err) {
//           console.error('Subscription error:', err);
//         } else {
//           console.log('Subscribed to /dashcam0058/remoteactions/');
//         }
//       });
//     });
  
//     mqttClient.on('error', (error) => {
//       console.error('Connection error:', error);
//     });
  
//     return mqttClient; // Ensure you return the client instance
//   };
  

// export const publishMessage = (client, topic, message) => {
//     console.log('Enter into publish message')
//   const payload = JSON.stringify({
//     message: message,
//   });
// console.log('Payload',payload)

//   client.publish(topic, payload, { qos: 1 }, (error) => {
//     console.log('Publish', topic, payload, error)
//     if (error) {
//       console.error('Publish error:', error);
//     } else {
//       console.log(`Message published to ${topic}: ${message}`);
//     }
//   });
// };
