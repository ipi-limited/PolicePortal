  // Login.js
  import React from 'react';
  import { useNavigate } from 'react-router-dom';
  import { Authenticator, View,Image,Text, useTheme } from '@aws-amplify/ui-react';
  import '@aws-amplify/ui-react/styles.css';
  import './Login.css';
  
  const Login = () => {
    const navigate = useNavigate();

    const handleSignIn = () => {
      navigate('/Dashboard');
    };

    async function signIn({ username, password }) {
      try {
        const { isSignedIn, nextStep } = await signIn({ username, password });
      } catch (error) {
        console.log('error signing in', error);
      }
    }

    
    const components = {
      SignIn: {
        Header() {
          const { tokens } = useTheme();
          return (
            <View>
             <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent:'center' }}>
              <Image
                alt="Road Angel Logo"
                src={`${process.env.PUBLIC_URL}/Images/roadAngel.png`}
                style={{ width: '100px'}}
              />
              <Image
                alt="Road Angel Name Logo"
                src={`${process.env.PUBLIC_URL}/Images/roadangelname.png`}
                style={{ width: '150px' }}
              />
            </View>
            <View textAlign="center">      
              <Text fontSize="large" fontWeight="bold" color={tokens.colors.font.primary}>
                Police Login Portal
              </Text>
            </View>
          </View>
          );
        },
      },
    //   ConfirmSignIn: {
    //     Header() {
    //         return <Text>Please enter the code sent to your email</Text>;
    //     }
    // }
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
