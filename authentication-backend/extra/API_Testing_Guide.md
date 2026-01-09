# Authentication API Testing Guide

## Prerequisites

- Server running on `http://localhost:5000`
- MongoDB connected
- Postman installed

---

## Test Cases

### 1. User Signup (POST `/auth/signup`)

**Endpoint:** `http://localhost:5000/auth/signup`

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "SecurePassword123!"
}
```

**Expected Response:**
- **Status:** `201 Created`
- **Body:**
```json
{
  "message": "Signup successful"
}
```

**Test Scenarios:**

| Scenario | Email | Password | Expected Status | Expected Message |
|----------|-------|----------|----------------|------------------|
| Valid signup | `user1@test.com` | `Password123!` | 201 | Signup successful |
| Duplicate email | `user1@test.com` | `Password123!` | 500 | Error (duplicate) |
| Missing email | - | `Password123!` | 500 | Error |
| Missing password | `user2@test.com` | - | 500 | Error |

---

### 2. User Login (POST `/auth/login`)

**Endpoint:** `http://localhost:5000/auth/login`

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "SecurePassword123!"
}
```

**Expected Response (Success):**
- **Status:** `200 OK`
- **Body:**
```json
{
  "message": "Login success"
}
```
- **Cookies Set:**
  - `accessToken` (HttpOnly)
  - `refreshToken` (HttpOnly)

**Expected Response (MFA Enabled):**
- **Status:** `200 OK`
- **Body:**
```json
{
  "message": "OTP sent"
}
```

**Test Scenarios:**

| Scenario | Email | Password | Expected Status | Expected Message |
|----------|-------|----------|----------------|------------------|
| Valid login | `user1@test.com` | `Password123!` | 200 | Login success |
| Wrong password | `user1@test.com` | `WrongPass123!` | 500 | Invalid credentials |
| Non-existent user | `fake@test.com` | `Password123!` | 500 | Invalid credentials |
| Account locked (after 5 failed attempts) | `user1@test.com` | `WrongPass` | 500 | Account locked |

---

### 3. User Logout (POST `/auth/logout`)

**Endpoint:** `http://localhost:5000/auth/logout`

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Cookies Required:**
- `accessToken` (from login)

**Expected Response:**
- **Status:** `200 OK`
- **Body:**
```json
{
  "message": "Logged out"
}
```
- **Cookies Cleared:**
  - `accessToken`
  - `refreshToken`

**Test Scenarios:**

| Scenario | Has Valid Token | Expected Status | Expected Message |
|----------|----------------|----------------|------------------|
| Valid logout | Yes | 200 | Logged out |
| No token | No | 401 | Unauthorized |
| Invalid token | Invalid | 401 | Invalid token |

---

## Testing Flow

### Complete User Journey

1. **Signup a new user**
   ```
   POST /auth/signup
   Body: { "email": "testuser@example.com", "password": "Test123!" }
   ```

2. **Login with the user**
   ```
   POST /auth/login
   Body: { "email": "testuser@example.com", "password": "Test123!" }
   ```
   ✅ Save the cookies from response

3. **Logout**
   ```
   POST /auth/logout
   (Cookies automatically sent by Postman)
   ```

4. **Try to logout again (should fail)**
   ```
   POST /auth/logout
   Expected: 401 Unauthorized
   ```

---

## Testing Account Lockout Feature

1. **Create a test user**
   ```
   POST /auth/signup
   Body: { "email": "locktest@example.com", "password": "Test123!" }
   ```

2. **Attempt login with wrong password 5 times**
   ```
   POST /auth/login
   Body: { "email": "locktest@example.com", "password": "WrongPassword" }
   ```
   Repeat 5 times

3. **Try with correct password (should be locked)**
   ```
   POST /auth/login
   Body: { "email": "locktest@example.com", "password": "Test123!" }
   Expected: Account locked error
   ```

4. **Wait 15 minutes and try again** (or manually update DB to unlock)

---

## Postman Tips

### Viewing Cookies
1. Click on **Cookies** link below the Send button
2. View cookies for `localhost:5000`
3. You should see `accessToken` and `refreshToken` after login

### Automatic Cookie Management
Postman automatically sends cookies with requests to the same domain, so you don't need to manually copy them for the logout endpoint.

### Environment Variables (Optional)
Create a Postman environment with:
- `baseUrl`: `http://localhost:5000`
- `email`: `test@example.com`
- `password`: `Test123!`

Then use `{{baseUrl}}/auth/signup` in your requests.

---

## Common Issues

### Issue: `req.body is undefined`
**Solution:** Make sure you select **Body → raw → JSON** in Postman and set the `Content-Type: application/json` header.

### Issue: Cookies not being sent
**Solution:** Ensure you're testing on the same domain (localhost:5000) and that cookies are enabled in Postman settings.

### Issue: 401 Unauthorized on logout
**Solution:** Make sure you logged in first and the cookies are still valid (access token expires in 15 minutes).

//app.ts
// Debug middleware
// app.use((req, _res, next) => {
//   console.log(`${req.method} ${req.path}`, { body: req.body, contentType: req.get('content-type') });
//   next();
// });