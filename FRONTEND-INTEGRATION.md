# Frontend Integration Guide - Gerador Frontend with Backend Auth

## Overview

This guide explains how to integrate the Gerador frontend with the new backend authentication system that uses Google OAuth 2.0.

## Key Changes

### 1. Environment Configuration

Create or update your `.env.local` file:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173
```

### 2. New Auth Service

The `services/authService.ts` file provides all authentication functionality:

#### Key Functions:

```typescript
// Initiate Google OAuth login
import { initiateGoogleLogin } from './services/authService';

// Handle OAuth callback and extract token
import { handleOAuthCallback } from './services/authService';

// Check if user is authenticated
import { isAuthenticated } from './services/authService';

// Get current user info
import { getCurrentUser } from './services/authService';

// Make authenticated API calls
import { authenticatedFetch } from './services/authService';

// Logout
import { logout } from './services/authService';
```

## Implementation Steps

### Step 1: Update App.tsx

```typescript
import { useEffect, useState } from 'react';
import { handleOAuthCallback, getCurrentUser, User } from './services/authService';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Handle OAuth callback on app load
      const callbackUser = await handleOAuthCallback();
      if (callbackUser) {
        setUser(callbackUser);
      } else {
        // Check if user is already logged in
        const currentUser = getCurrentUser();
        setUser(currentUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <>Welcome, {user.name}!</>
      ) : (
        <LoginButton />
      )}
    </div>
  );
}
```

### Step 2: Create LoginButton Component

```typescript
// components/LoginButton.tsx
import { initiateGoogleLogin } from '../services/authService';

export function LoginButton() {
  return (
    <button onClick={initiateGoogleLogin}>
      Login with Google
    </button>
  );
}
```

### Step 3: Update API Service Calls

All API calls to backend should use `authenticatedFetch`:

```typescript
// Before (Direct API Key):
const response = await fetch('https://api.gemini.com/generate', {
  headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
});

// After (Via Backend):
import { authenticatedFetch } from './services/authService';

const response = await authenticatedFetch('/flow-generate', {
  method: 'POST',
  body: JSON.stringify({ prompt: 'Your prompt' })
});
```

### Step 4: Remove API Keys from Frontend

**Files to Update:**

1. **geminiService.ts** - Remove `process.env.API_KEY`
2. **.env.local** - Remove all API keys
3. **vite.config.ts** - Remove API key references

### Step 5: Create Protected Route Component

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

export function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}
```

### Step 6: Update geminiService.ts Pattern

```typescript
// Before:
export const generateContent = async (prompt: string) => {
  const response = await fetch('https://api.gemini.com/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_API_KEY}`
    },
    body: JSON.stringify({ prompt })
  });
  return response.json();
};

// After:
import { authenticatedFetch } from './authService';

export const generateContent = async (prompt: string) => {
  const response = await authenticatedFetch('/flow-generate', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  });
  return response.json();
};
```

## OAuth Flow

```
User clicks "Login with Google"
    ↓
[Frontend] initiateGoogleLogin()
    ↓
Redirects to: http://localhost:3000/auth/google
    ↓
[Backend] Passport middleware handles Google OAuth
    ↓
User logs in with Google
    ↓
[Backend] Creates JWT token
    ↓
Redirects to: http://localhost:5173?token=JWT_TOKEN
    ↓
[Frontend] handleOAuthCallback() extracts token
    ↓
Token saved to localStorage
    ↓
User is authenticated!
```

## Token Management

Tokens are stored in `localStorage` with keys:
- `auth_token` - JWT token for API requests
- `auth_user` - Decoded user information

## API Endpoints (Via Backend)

### Generate Content
```
POST /flow-generate
Headers: Authorization: Bearer TOKEN
Body: { prompt: string }
Response: { download_url, metadata }
```

### Get Status
```
GET /flow-status/:id
Headers: Authorization: Bearer TOKEN
Response: { status, progress, result }
```

## Logout

```typescript
import { logout } from './services/authService';

const handleLogout = async () => {
  await logout();
  // Redirect to home
  window.location.href = '/';
};
```

## Common Issues

### CORS Errors
- Ensure backend has `FRONTEND_URL` in CORS whitelist
- Check `VITE_BACKEND_URL` matches backend URL

### Token Expired
- Token is automatically cleared on 401 responses
- User will be logged out and redirected

### OAuth Callback Not Working
- Verify backend `GOOGLE_CALLBACK_URL` in Google Cloud Console
- Check frontend redirect URL in `.env.local`

## Security Checklist

✅ API keys REMOVED from frontend  
✅ All sensitive operations behind authentication  
✅ HTTPS enabled in production  
✅ Tokens use httpOnly storage recommendation  
✅ CORS properly configured  
✅ Rate limiting on backend  

## Next Steps

1. Update all service files to use `authenticatedFetch`
2. Remove all direct API key references
3. Test OAuth flow locally
4. Test authenticated API calls
5. Deploy to production

## Troubleshooting

### Test Authentication
```typescript
import { isAuthenticated, getCurrentUser } from './services/authService';

console.log('Authenticated:', isAuthenticated());
console.log('User:', getCurrentUser());
```

### Test API Call
```typescript
import { authenticatedFetch } from './services/authService';

authenticatedFetch('/flow-generate', {
  method: 'POST',
  body: JSON.stringify({ prompt: 'test' })
}).then(r => r.json()).then(console.log);
```

## References

- Backend Auth Setup: `../gerador-backend/AUTHENTICATION-SETUP.md`
- Google OAuth Docs: https://developers.google.com/identity/protocols/oauth2
