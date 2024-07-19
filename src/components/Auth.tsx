// src/components/Auth.js
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import SignIn from './SignIn';
import SignUp from './SignUp';

function Auth() {
    const [user] = useAuthState(auth);

    if (user) {
        return (
            <div>
                <p>Welcome, {user.email}</p>
                <button onClick={() => auth.signOut()}>Sign Out</button>
            </div>
        );
    }

    return (
        <div>  
            <SignUp />
            <SignIn />
        </div>
    );
}

export default Auth;