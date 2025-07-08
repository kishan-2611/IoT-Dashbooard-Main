'use client';

import type { User } from '@/types/user';
import axios from 'axios';


const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  ein:string,
  role:string
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    const { firstName, lastName, ein, role, password, email } = params;

    try {
      // Make API request
      const res = await axios.post('http://localhost:3302/authenticate/register', {
        email,
        ein,
        role,
        firstName,
        lastName, 
        password,
      });

      if (res?.data?.success) {
        return {};  // Successful sign up, no error
      } else {
        return { error: 'Sign up failed' };  // Handle sign-up failure
      }
    } catch (err) {
      return { error: 'An error occurred during sign up. Please try again.' };  // Provide user-friendly error
    }
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
  const { email, password } = params;

  // Hardcoded credentials
  if (email === "23mca009kishan@eitfaridabad.co.in" && password === "Iot-dashboard") {
    localStorage.setItem("authToken", "mock-token");
    localStorage.setItem("role", "admin"); // or any role you'd like
    return {};
  } else {
    return { error: "Invalid email or password" };
  }
}


  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request

    // We do not handle the API, so just check if we have a token in localStorage.
    const token = localStorage.getItem('authToken');

    if (!token) {
      return { data: null };
    }

    return { data: user };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('authToken');

    return {};
  }
}

export const authClient = new AuthClient();