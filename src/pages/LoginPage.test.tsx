import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from './LoginPage';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
}));

describe('LoginPage', () => {
  test('renders login form by default', () => {
    render(
      <Router>
        <LoginPage />
      </Router>
    );
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Accedi')).toBeInTheDocument();
  });

  test('switches to sign up form', () => {
    render(
      <Router>
        <LoginPage />
      </Router>
    );
    fireEvent.click(screen.getByText('Non hai un account? Registrati'));
    expect(screen.getByPlaceholderText('Nome (opzionale)')).toBeInTheDocument();
    expect(screen.getByText('Registrati')).toBeInTheDocument();
  });
});
