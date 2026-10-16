# SnapLoad 🎬

**SnapLoad** is a responsive video link inspection and download application built with React, Vite, Tailwind CSS, Node.js, and Express. It provides a simple interface for checking supported media links, previewing video metadata, selecting available YouTube video quality, and tracking download progress.

## ✨ Features

- 🔗 **Multi-platform link detection** — Instagram, YouTube, and Pinterest.
- 🎥 **Video metadata** — Retrieve supported video details and thumbnails.
- 📥 **Video downloads** — Download supported direct video files and configured YouTube downloads.
- 🎚️ **Quality selection** — Select a target quality from 144p up to 2160p, or choose the best available option for supported YouTube downloads.
- 📊 **Download progress** — View download progress and transferred file size.
- 📱 **Responsive interface** — Layout adapts to desktop, tablet, and mobile screens.
- 🎬 **Cinematic loading screen** — Animated Lights, Camera, Action experience.
- 🛡️ **Input validation** — Validate supported URLs and provide user-facing error messages.

> Platform support and download availability depend on the source, available formats, API configuration, and hosting environment.

## 🧰 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- JavaScript
- Fetch API

### Backend
- Node.js
- Express.js
- Helmet
- CORS
- Express rate limiting

### Media and APIs
- YouTube Data API
- Python
- yt-dlp
- FFmpeg

## 📁 Project Structure

```text
Ytviddownload/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following before running SnapLoad locally:

- Node.js and npm
- Python
- yt-dlp
- FFmpeg
- A YouTube Data API key for configured YouTube metadata features

Verify the installations:

```bash
node --version
npm --version
python --version
py -m yt_dlp --version
ffmpeg -version
```

On Windows, use `py` for Python commands when appropriate.

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Ytviddownload
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

### 2. Install frontend dependencies

```bash
cd client
npm install
npm run dev
```

The Vite development server typically runs at:

```text
http://localhost:5173
```

### 3. Install backend dependencies

Open a second terminal:

```bash
cd server
npm install
```

Create the backend environment file described below, then start the server:

```bash
npm start
```

If your backend `package.json` does not define a `start` script, use its configured development script or add an appropriate start script.

The backend typically runs on port `5000`.

## 🔐 Environment Variables

Create `server/.env` locally:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
YOUTUBE_API_KEY=your_youtube_data_api_key
```

Use the actual variable names expected by your backend code. Never commit real API keys, credentials, or `.env` files to a public repository.

Your frontend API configuration must point to the correct backend:

```js
const API_BASE_URL = "http://localhost:5000/api";
```

For production, replace the local address with your deployed backend URL or configure the frontend to read an appropriate Vite environment variable.

For example, a production frontend variable could be:

```env
VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com/api
```

If you adopt this variable, update the API service to read `import.meta.env.VITE_API_BASE_URL`.

## 🔌 API Endpoints

The following routes are configured in the project:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Backend health check |
| GET | `/api/health` | API health check |
| GET | `/api` | API information, if configured |
| POST | `/api/info` | Retrieve supported media metadata |
| GET | `/api/direct-media/inspect` | Inspect a direct media URL |
| GET | `/api/direct-media/download` | Download a supported direct media file |
| GET | `/api/youtube/download` | Process a configured YouTube download |

The `/api/info` request expects a JSON body containing the source URL, according to the current frontend service implementation.

You can test the local health endpoint at:

```text
http://localhost:5000/api/health
```

A successful health response confirms that the API is reachable; it does not guarantee that every media download dependency is working.

## ☁️ Deployment

### Frontend — Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Set the project root directory to `client`.
4. Use `npm run build` as the build command.
5. Use `dist` as the output directory.
6. Configure the production API URL.
7. Redeploy after changing environment variables.

### Backend — Render

1. Create a new Web Service and connect the GitHub repository.
2. Configure the service root directory as `server`, if using that directory as the service root.
3. Configure the Node.js build and start commands.
4. Set the required environment variables in the Render dashboard.
5. Configure CORS to allow the deployed frontend domain.
6. Ensure Python, yt-dlp, and FFmpeg are installed and accessible in the runtime environment.

**Deployment note:** Confirm that the selected hosting plan supports the required runtime dependencies, download duration, temporary disk usage, and outbound network access. A Node.js deployment alone does not install Python or FFmpeg.

## 🧪 Production Checklist

- [ ] Frontend points to the deployed backend.
- [ ] Backend health endpoint responds successfully.
- [ ] CORS allows the production frontend domain.
- [ ] API keys are stored as environment variables.
- [ ] Python, yt-dlp, and FFmpeg are available on the backend.
- [ ] Metadata requests work in production.
- [ ] Direct-media downloads work for permitted URLs.
- [ ] YouTube downloads and selected formats are tested.
- [ ] Mobile layout and download progress are verified.
- [ ] Temporary files are cleaned up after downloads.
- [ ] URL validation, request limits, file-size limits, and network access controls are reviewed.

## 🔒 Responsible Use

Use SnapLoad only with media you own or have permission to download. Follow the source platform's terms, applicable copyright laws, and any restrictions on accessing or downloading content. Do not use the application to bypass access controls or download unauthorized private content.

For public deployment, review server-side URL validation and protections against server-side request forgery (SSRF). Restrict outbound requests to approved destinations and enforce appropriate file-size, timeout, and rate limits.

## 📄 License

No license has been specified yet. Add an appropriate `LICENSE` file before distributing the project publicly.
