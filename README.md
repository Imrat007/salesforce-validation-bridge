# 🚀 Salesforce Validation Rules Bridge

A production-ready web application for managing Salesforce validation rules with a modern, intuitive interface. Built with React, Express, and industry-standard best practices.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## ✨ Features

- 🔐 **Secure OAuth 2.0 Authentication** with PKCE support
- 🌐 **Multi-Environment Support** (Production, Sandbox, Custom Domain)
- 📊 **Real-time Validation Rules Management**
- 🎨 **Modern Salesforce Lightning-Inspired UI**
- 🔍 **Search and Filter Capabilities**
- 🛡️ **Security Best Practices** (Helmet, Rate Limiting, CORS)
- ⚡ **High Performance** with compression and caching
- 📱 **Fully Responsive Design**
- ♿ **Accessibility Compliant**

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Salesforce Connected App credentials

## 🔧 Installation

### 1. Clone or Extract the Project

```bash
cd salesforce-validation-bridge
```

### 2. Install Dependencies

Install all dependencies for both backend and frontend:

```bash
npm run install:all
```

Or install individually:

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your Salesforce credentials:

```env
CLIENT_ID=your_salesforce_connected_app_client_id
CLIENT_SECRET=your_salesforce_connected_app_client_secret
REDIRECT_URI=http://localhost:3000/oauth/callback
SESSION_SECRET=generate_a_secure_random_string_here
PORT=3000
NODE_ENV=development
```

### 4. Set Up Salesforce Connected App

1. Log in to your Salesforce org
2. Navigate to: **Setup** → **Apps** → **App Manager**
3. Click **New Connected App**
4. Fill in the required fields:
   - **Connected App Name**: Validation Rules Bridge
   - **API Name**: Validation_Rules_Bridge
   - **Contact Email**: your-email@example.com
5. Enable OAuth Settings:
   - **Callback URL**: `http://localhost:3000/oauth/callback`
   - **Selected OAuth Scopes**:
     - Access and manage your data (api)
     - Perform requests on your behalf at any time (refresh_token, offline_access)
6. Enable **Require Secret for Web Server Flow**
7. Enable **Require Secret for Refresh Token Flow**
8. Save and note your **Consumer Key** (CLIENT_ID) and **Consumer Secret** (CLIENT_SECRET)

## 🚀 Running the Application

### Development Mode

Start both backend and frontend in development mode:

```bash
npm run dev
```

Or start them individually:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Production Mode

Build and run in production:

```bash
# Build frontend
npm run build

# Start production server
npm start
```

The application will be available at: http://localhost:3000

## 📁 Project Structure

```
salesforce-validation-bridge/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── config.js          # Configuration management
│   │   ├── middleware/
│   │   │   ├── auth.js             # Authentication middleware
│   │   │   └── errorHandler.js    # Error handling
│   │   ├── routes/
│   │   │   ├── index.js            # Main router
│   │   │   ├── auth.routes.js      # OAuth routes
│   │   │   └── api.routes.js       # API routes
│   │   ├── services/
│   │   │   └── salesforceService.js # Salesforce API interactions
│   │   ├── utils/
│   │   │   ├── logger.js           # Logging utility
│   │   │   └── pkce.js             # PKCE utilities
│   │   └── server.js               # Express server
│   ├── .env                        # Environment variables
│   ├── .env.example                # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main React component
│   │   ├── App.css                 # Component styles
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global styles
│   ├── index.html                  # HTML template
│   ├── vite.config.js              # Vite configuration
│   └── package.json
├── package.json                    # Root package.json
└── README.md                       # This file
```

## 🔒 Security Features

- **PKCE (Proof Key for Code Exchange)** for OAuth 2.0
- **Helmet.js** for security headers
- **Rate Limiting** to prevent abuse
- **CORS** configuration
- **Secure session management**
- **Input validation and sanitization**
- **Environment variable protection**

## 🌐 API Endpoints

### Authentication
- `GET /login` - Initiate OAuth flow
- `GET /oauth/callback` - OAuth callback handler
- `POST /logout` - Terminate session
- `GET /logout` - Browser-friendly logout

### API
- `GET /api/me` - Get current user info
- `GET /api/validation-rules` - Fetch all validation rules
- `POST /api/validation-toggle` - Toggle validation rule status

### Health
- `GET /health` - Health check endpoint

## 🎨 UI Features

- **Salesforce Lightning Design System** inspired interface
- **Responsive** design for mobile, tablet, and desktop
- **Search and filter** functionality
- **Real-time updates** with loading states
- **Error handling** with user-friendly messages
- **Accessibility** compliant (WCAG 2.1)

## 🔧 Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CLIENT_ID` | Yes | - | Salesforce Connected App Client ID |
| `CLIENT_SECRET` | Yes | - | Salesforce Connected App Client Secret |
| `REDIRECT_URI` | Yes | - | OAuth callback URL |
| `SESSION_SECRET` | Yes | - | Session encryption secret |
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Environment (development/production) |
| `TOOLING_API_VERSION` | No | v59.0 | Salesforce Tooling API version |
| `APP_URL` | No | Auto-detected | Frontend URL |
| `LOG_LEVEL` | No | info | Logging level (error/warn/info/debug) |

## 📝 Scripts

### Root Level
- `npm run install:all` - Install all dependencies
- `npm run dev` - Start development mode
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prod` - Build and start production
- `npm test` - Run all tests
- `npm run lint` - Lint all code

### Backend
- `npm start` - Start production server
- `npm run dev` - Start with nodemon
- `npm run lint` - ESLint check
- `npm run lint:fix` - Fix linting issues
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - ESLint check
- `npm run lint:fix` - Fix linting issues

## 🐛 Troubleshooting

### Common Issues

**1. "Missing required environment variable" error**
- Ensure all required variables are set in `backend/.env`
- Check that the `.env` file is in the correct location

**2. "Could not connect to server" error**
- Verify the backend is running on port 3000
- Check firewall settings
- Ensure no other service is using port 3000

**3. OAuth authentication fails**
- Verify Salesforce Connected App credentials
- Check that the callback URL matches exactly
- Ensure proper OAuth scopes are selected

**4. Session expires immediately**
- Check `SESSION_SECRET` is set correctly
- Verify cookie settings (secure flag in production)
- Check browser cookie settings

## 🚢 Deployment

### Production Checklist

1. ✅ Generate a strong `SESSION_SECRET`
2. ✅ Set `NODE_ENV=production`
3. ✅ Update `REDIRECT_URI` to production URL
4. ✅ Update Salesforce Connected App callback URL
5. ✅ Build frontend: `npm run build`
6. ✅ Configure production session store (Redis recommended)
7. ✅ Set up SSL/HTTPS
8. ✅ Configure production logging
9. ✅ Set up monitoring and error tracking

### Recommended Production Setup

- **Session Store**: Redis or PostgreSQL
- **Reverse Proxy**: Nginx or Apache
- **Process Manager**: PM2 or systemd
- **SSL**: Let's Encrypt or CloudFlare
- **Monitoring**: PM2 Dashboard, New Relic, or Datadog

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm run install:all
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Organization

## 🙏 Acknowledgments

- Salesforce Lightning Design System for UI inspiration
- React and Express communities
- All contributors and users

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: imratdhakad752@gmail.com

## 📚 Additional Resources

- [Salesforce OAuth Documentation](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_oauth_and_connected_apps.htm)
- [Salesforce Tooling API](https://developer.salesforce.com/docs/atlas.en-us.api_tooling.meta/api_tooling/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)

---

Made with ❤️ for the Salesforce community
