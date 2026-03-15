import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import Login from '../src/pages/Login';
import api from '../src/services/api';

// Mock react-router-dom navigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the api module
jest.mock('../src/services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

describe('Login Page', () => {
  beforeEach(() => {
    api.post.mockResolvedValue({
      data: {
        token: 'fake-token',
        user: { id: '1', role: 'ADMIN', email: 'admin@eduerp.com', name: 'Admin' }
      }
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('renders login form fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('shows error banner on failed login', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } }
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'wrong@edu.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
