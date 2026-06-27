# Frontend Netlify Deployment Steps

1. Push the code to GitHub.

2. In Netlify, choose **Add new site** -> **Import an existing project**.

3. Select your GitHub repository.

4. Use these build settings:

```txt
Base directory: frontend
Build command: npm run build
Publish directory: .next
```

5. Add this environment variable in Netlify:

```txt
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
```

6. Deploy the site.

7. If Netlify asks for a Next.js plugin, use:

```txt
@netlify/plugin-nextjs
```

8. After deploy, open the Netlify URL.

If you still get **Page not found**, check:

```txt
Site settings -> Build & deploy -> Build settings
```

Make sure:

```txt
Base directory = frontend
Publish directory = .next
```

Do not use:

```txt
Publish directory = out
Publish directory = build
Publish directory = frontend
```

This project is Next.js, not a plain static React app.
