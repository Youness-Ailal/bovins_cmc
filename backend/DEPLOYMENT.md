# Deploy the backend to Vercel

## Project settings

- Import the repository into Vercel.
- Set **Root Directory** to `backend`.
- Leave Framework Preset and build settings on automatic detection.
- The project includes `vercel.json`, which routes all backend requests to
  `api/index.js`.

## Environment variables

Add these variables for Production and Preview:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (optional, defaults to `7d`)
- `CLIENT_ORIGIN` (the deployed frontend URL; multiple URLs can be comma-separated)
- `GEMINI_API_KEY` (required only for BoviAI)

Do not add `PORT`; Vercel manages the HTTP listener.

## MongoDB Atlas

Vercel Functions do not have one stable outbound IP by default. Atlas must allow
the deployment to connect. For a basic deployment, add `0.0.0.0/0` to Atlas
Network Access and protect the database with a strong, rotated database password.
For stricter production networking, use a fixed-egress/private-network option.

## Frontend

Set the frontend variable to the deployed backend URL:

`NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.vercel.app/api`

## Realtime limitation

The REST API works on Vercel serverless functions. Socket.IO/WebSocket realtime
events are only initialized by `npm start` on a traditional Node server and are
not available from the Vercel deployment. If realtime alerts are required in
production, deploy the backend on a long-running Node host such as Railway,
Render, Fly.io, or a VPS, or move realtime events to a managed realtime service.

## Verification

After deployment, open:

`https://YOUR-BACKEND.vercel.app/health`

The expected response is:

`{"status":"ok"}`
