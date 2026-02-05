# Frontend Deployment & Environment Setup

## 1. Environment Variables
- Copy `.env.example` to `.env` and update values as needed.
- Example:
  ```bash
  cp .env.example .env
  # Edit .env for your environment
  ```

## 2. Install Dependencies
```bash
npm install
```

## 3. Development Server
```bash
npm run dev
```

## 4. Build for Production
```bash
npm run build
```

## 5. Preview Production Build
```bash
npm run preview
```

## 6. Deployment (Vercel)
- Vercel uses `vercel.json` and builds with `npm run build`.
- Set environment variables in Vercel dashboard (`VITE_API_BASE`).

## 7. Environment Variable Management
- All API URLs and secrets should be set in `.env` and referenced via `import.meta.env`.
- Changing `.env` values will update the build output after running `npm run build` again.

## 8. Proxy Setup
- Vite proxy is configured in `vite.config.js` for local development.

---
For any environment change, update `.env` and redeploy/build as needed.
