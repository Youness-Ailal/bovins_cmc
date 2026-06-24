# Deploy the backend to Vercel

## Project settings

- Import the repository into Vercel.
- Set **Root Directory** to `backend`.
- Leave Framework Preset and build settings on automatic detection.

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

## Verification

After deployment, open:

`https://YOUR-BACKEND.vercel.app/health`

The expected response is:

`{"status":"ok"}`
