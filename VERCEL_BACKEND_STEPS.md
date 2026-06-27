# Backend Vercel Deployment Steps

1. Push the code to GitHub.

2. In Vercel, import the project.

3. Set **Root Directory** to:

```txt
backend
```

4. Add these backend environment variables in Vercel:

```txt
MONGO_URI
JWT_SECRET
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=https://your-frontend-url.vercel.app
GEMINI_API_KEY
```

5. In MongoDB Atlas, allow Vercel to connect:

```txt
Network Access -> Add IP -> 0.0.0.0/0
```

6. Deploy the backend.

7. Test the backend health endpoint:

```txt
https://your-backend.vercel.app/health
```

Expected response:

```json
{"status":"ok"}
```

8. In the frontend Vercel project, set:

```txt
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
```

Note: The REST API works on Vercel. Socket.IO realtime alerts need a long-running Node host such as Railway, Render, Fly.io, or a VPS.
