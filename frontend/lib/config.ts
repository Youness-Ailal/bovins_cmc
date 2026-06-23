// Central frontend configuration.
// The default lets the app run out of the box against a local backend; override
// it by setting NEXT_PUBLIC_API_URL (e.g. in .env.local) for other environments.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
