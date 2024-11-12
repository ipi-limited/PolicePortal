// // AuthContext.js
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
// import AWS from 'aws-sdk';

// const poolData = {
//   UserPoolId: 'eu-west-2_9hCbrQq4P',
//   ClientId: '47ko5gjvt7h5l64c6ej3a22shj',
// };
// const identityPoolId = 'eu-west-2:eb767e70-8369-4099-9596-58f5d78cd65c';
// const region = 'eu-west-2';

// const userPool = new CognitoUserPool(poolData);

// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [idToken, setIdToken] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const cognitoUser = userPool.getCurrentUser();
//     if (cognitoUser) {
//       cognitoUser.getSession((err, session) => {
//         if (err) {
//           console.error(err);
//           return;
//         }
//         if (session.isValid()) {
//           setIsAuthenticated(true);
//           setIdToken(session.getIdToken().getJwtToken());
//           setUser(cognitoUser);
//         }
//         setLoading(false); 
//       });
//     }
//     else {
//         setLoading(false); 
//     }
//   }, []);

//   // Function to sign in a user
//   const signIn = (username, password) => {
//     return new Promise((resolve, reject) => {
//       const authenticationDetails = new AuthenticationDetails({
//         Username: username,
//         Password: password,
//       });

//       const cognitoUser = new CognitoUser({
//         Username: username,
//         Pool: userPool,
//       });

//       cognitoUser.authenticateUser(authenticationDetails, {
//         onSuccess: (result) => {
//           const idToken = result.getIdToken().getJwtToken();
//           setIdToken(idToken);
//           setUser(cognitoUser);
//           setIsAuthenticated(true);
//           localStorage.setItem('username', username);
//           localStorage.setItem('idToken', idToken);
//           localStorage.setItem('password',password)

//           // Configure AWS credentials using the identity pool and idToken
//           AWS.config.update({
//             region: region,
//             credentials: new AWS.CognitoIdentityCredentials({
//               IdentityPoolId: identityPoolId,
//               Logins: {
//                 [`cognito-idp.${region}.amazonaws.com/${poolData.UserPoolId}`]: idToken,
//               },
//             }),
//           });

//           // Refresh AWS credentials
//           AWS.config.credentials.refresh((err) => {
//             if (err) {
//               console.error('Error refreshing AWS credentials:', err);
//               reject(err);
//             } else {
//               console.log('AWS credentials refreshed');
//               resolve(cognitoUser);
//             }
//           });
//         },
//         onFailure: (err) => {
//           console.error('Error authenticating user:', err);
//           reject(err);
//         },
//       });
//     });
//   };

//   const signOut = () => {
//     if (user) {
//       user.signOut();
//       setUser(null);
//       setIdToken(null);
//       setIsAuthenticated(false);
      
//       // Clear sessionStorage
//       sessionStorage.removeItem('username');
//       sessionStorage.removeItem('idToken');
  
//       AWS.config.credentials.clearCachedId();
//       console.log('User signed out');
//     }
//   };

//   useEffect(() => {
//     const currentUser = userPool.getCurrentUser();
//     if (currentUser) {
//       currentUser.getSession((err, session) => {
//         if (err || !session.isValid()) {
//           setLoading(false);
//           setIsAuthenticated(false);
//         } else {
//           const idToken = session.getIdToken().getJwtToken();
//           setIdToken(idToken);
//           setUser(currentUser);
//           setIsAuthenticated(true);
//           AWS.config.update({
//             region: region,
//             credentials: new AWS.CognitoIdentityCredentials({
//               IdentityPoolId: identityPoolId,
//               Logins: {
//                 [`cognito-idp.${region}.amazonaws.com/${poolData.UserPoolId}`]: idToken,
//               },
//             }),
//           });

//           AWS.config.credentials.refresh((err) => {
//             if (err) {
//               console.error('Error refreshing AWS credentials:', err);
//             } else {
//               console.log('AWS credentials refreshed');
//             }
//           });

//           setLoading(false);
//         }
//       });
//     } else {
//       setLoading(false);
//     }
//   }, []);
  

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, signIn, user, idToken, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
