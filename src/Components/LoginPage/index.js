  // Login.js
  import React from 'react';
  import { useNavigate } from 'react-router-dom';
  import { Authenticator, View,Image,Text, useTheme } from '@aws-amplify/ui-react';
  import '@aws-amplify/ui-react/styles.css';
  import './Login.css';
  import Header from '../../Header';

  const Login = () => {
    const navigate = useNavigate();

    const handleSignIn = () => {
      navigate('/Dashboard');
    };

    const components = {
      SignIn: {
        Header() {
          const { tokens } = useTheme();
          return (
            <View textAlign="center" padding={tokens.space.large}>
              <Image
                alt="Police Department Logo"
                src="https://docs.amplify.aws/assets/logo-dark.svg"
                style={{ width: '100px', marginBottom: tokens.space.large }}
              />
              <Text fontSize="large" fontWeight="bold" color={tokens.colors.font.primary}>
                Police Login Portal
              </Text>
            </View>
          );
        },
      },
    };
  

    return (
      <div className="login-page">
        <Authenticator 
        components={components}
        hideSignUp={true}
        initialState="signIn" 
        onSignIn={handleSignIn} 
        >
          {() => (
            <main className="login-container">
            </main>
          )}
        </Authenticator>
      </div>
    );
  };

  export default Login;
