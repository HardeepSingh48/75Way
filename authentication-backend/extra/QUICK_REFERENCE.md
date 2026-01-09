# Quick Reference - API Testing

## 🚀 Quick Start

### 1. Import into Postman
```
File → Import → Select "Authentication_API.postman_collection.json"
```

### 2. Ensure Server is Running
```bash
npm run dev
```
Server should be at: `http://localhost:5000`

---

## 📋 Test Sequence

### Basic Flow (Copy & Paste into Postman)

**1. Signup**
```
POST http://localhost:5000/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Test123!"
}
```

**2. Login**
```
POST http://localhost:5000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Test123!"
}
```
✅ Cookies are automatically saved

**3. Logout**
```
POST http://localhost:5000/auth/logout
```
✅ Cookies are automatically sent

---

## 🎯 Expected Results

| Endpoint | Success Status | Success Message |
|----------|---------------|-----------------|
| `/auth/signup` | 201 | "Signup successful" |
| `/auth/login` | 200 | "Login success" |
| `/auth/logout` | 200 | "Logged out" |

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `req.body is undefined` | Wrong body format | Select **Body → raw → JSON** |
| `401 Unauthorized` | No/invalid token | Login first to get cookies |
| `Invalid credentials` | Wrong email/password | Check credentials |
| `Account locked` | 5 failed login attempts | Wait 15 minutes |

---

## 🔐 Security Features to Test

- ✅ **Password Hashing** - Passwords stored as bcrypt hashes
- ✅ **JWT Tokens** - Access token (15min) & Refresh token (7 days)
- ✅ **HttpOnly Cookies** - Tokens stored in secure cookies
- ✅ **Account Lockout** - 5 failed attempts = 15min lock
- ✅ **Rate Limiting** - 100 requests per 15 minutes
- ✅ **Helmet Security** - Security headers enabled

---

## 📊 Test Coverage Checklist

- [ ] Signup with valid data
- [ ] Signup with duplicate email (should fail)
- [ ] Login with valid credentials
- [ ] Login with invalid password (should fail)
- [ ] Login with non-existent user (should fail)
- [ ] Logout with valid token
- [ ] Logout without token (should fail)
- [ ] Test account lockout (5 failed attempts)
- [ ] Verify cookies are set after login
- [ ] Verify cookies are cleared after logout
