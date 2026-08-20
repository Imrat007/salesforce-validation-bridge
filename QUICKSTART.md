# 🚀 Quick Start Guide

Get your Salesforce Validation Rules Bridge up and running in 5 minutes!

## ⚡ Fast Setup

### Step 1: Install Dependencies (1 min)

```bash
cd salesforce-validation-bridge
npm run install:all
```

### Step 2: Configure Salesforce (2 min)

1. Go to **Salesforce Setup** → **Apps** → **App Manager**
2. Click **New Connected App**
3. Fill in:
   - Name: `Validation Rules Bridge`
   - Contact Email: Your email
4. Enable OAuth:
   - Callback URL: `http://localhost:3000/oauth/callback`
   - Scopes: Select `api` and `refresh_token`
5. Save and copy **Consumer Key** and **Consumer Secret**

### Step 3: Setup Environment (1 min)

Create `backend/.env`:

```env
CLIENT_ID=paste_consumer_key_here
CLIENT_SECRET=paste_consumer_secret_here
REDIRECT_URI=http://localhost:3000/oauth/callback
SESSION_SECRET=any_random_long_string_here
PORT=3000
NODE_ENV=development
```

### Step 4: Run Application (1 min)

```bash
npm run dev
```

### Step 5: Access Application

Open your browser:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 🎉 You're Ready!

1. Click **Login with Salesforce**
2. Select your environment (Production/Sandbox/Custom)
3. Authorize the app
4. Click **Refresh Rules** to load validation rules
5. Toggle rules on/off as needed

## 💡 Tips

- Use **Production** for your main Salesforce org
- Use **Sandbox** for testing environments
- Use **Custom Domain** if you have a My Domain URL
- Search and filter rules using the controls
- Session lasts 24 hours

## 🆘 Need Help?

- **Backend not starting?** Check that port 3000 is free
- **Frontend not loading?** Check that port 5173 is free
- **OAuth failing?** Verify Connected App callback URL matches
- **No rules showing?** Click the "Refresh Rules" button

## 📚 Full Documentation

See [README.md](./README.md) for complete documentation.

---

Happy managing! 🎊
