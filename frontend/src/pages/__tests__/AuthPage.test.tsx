import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AuthPage from '@/pages/AuthPage';
import { useAuth } from '@/features/auth/AuthContext';
import { rolesService } from '@/services/roles';

vi.mock('@/features/auth/AuthContext');
vi.mock('@/services/roles');

const mockedUseAuth = vi.mocked(useAuth);
const mockedRolesList = vi.mocked(rolesService.list);

const login = vi.fn();
const register = vi.fn();
const clearError = vi.fn();

function setup() {
  mockedUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    login,
    register,
    logout: vi.fn(),
    clearError,
  });
  mockedRolesList.mockResolvedValue([
    { id: 1, name: 'Student/Staff' },
    { id: 2, name: 'Maintenance Officer' },
    { id: 3, name: 'Administrator' },
  ]);
  return render(
    <MemoryRouter>
      <AuthPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  login.mockReset();
  register.mockReset();
  clearError.mockReset();
});

describe('AuthPage', () => {
  it('defaults to the login view with just email/password', () => {
    setup();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument();
  });

  it('submits login with email and password', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Email'), 'ada.obi@miva.edu');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ email: 'ada.obi@miva.edu', password: 'password123' });
    });
  });

  it('switches to the register view and shows the role picker', async () => {
    setup();
    await userEvent.click(screen.getByText('Create an account'));

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Officer')).toBeInTheDocument());
  });

  it('registers with the selected role id fetched from the API', async () => {
    setup();
    await userEvent.click(screen.getByText('Create an account'));
    await waitFor(() => expect(screen.getByText('Officer')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Officer'));
    await userEvent.type(screen.getByLabelText('Full name'), 'James Okoro');
    await userEvent.type(screen.getByLabelText('Email'), 'james@miva.edu');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        name: 'James Okoro',
        email: 'james@miva.edu',
        password: 'password123',
        roleId: 2,
      });
    });
  });

  it('shows the error message returned by the auth context', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: 'Incorrect email or password',
      login,
      register,
      logout: vi.fn(),
      clearError,
    });
    mockedRolesList.mockResolvedValue([]);
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Incorrect email or password')).toBeInTheDocument();
  });
});
