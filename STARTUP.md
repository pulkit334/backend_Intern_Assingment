# how to run

## backend

```bash
cd backend
npm install
npm run dev     # nodemon, auto-restarts on changes
```

runs on http://localhost:5000

## frontend

```bash
cd frontend
npm install
npm start
```

runs on http://localhost:3000

## env

backend `.env` already has MongoDB URI, JWT secret, and Cloudinary creds. should work out of the box.

## what it does

- sign up / log in
- create posts with text or images
- like and comment on posts
- edit name on profile page
- search / sort posts

## structure

```
backend/
  server.js          entry
  config/            env, db, cloudinary
  controllers/       route handlers
  services/          business logic
  middleware/        auth, validation, error handling
  models/            user and post schemas
  routes/            api routes
  validators/        input rules
  utils/             logger, errors, response helpers

frontend/src/
  api/               axios client + endpoint wrappers
  components/        postcard, toast, error boundary, loader
  pages/             login, signup, feed, profile
  context/           auth state + localStorage persistence
  hooks/             useLocalStorage, useForm, usePosts
  utils/             constants, helper functions
```
