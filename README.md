# Web Crawler – Full-Stack Test Project

## 📘 Overview

This project is a full-stack web application built as part of a technical assessment for a Full-Stack Developer position at Sykell. It allows users to submit URLs for analysis and returns structured information about the page, including HTML version, title, heading counts, link classification, and presence of login forms.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Go (Gin framework)
- **Database:** MySQL
- **Containerization:** Docker & Docker Compose
- **Testing:** Playwright

---

## ✅ Features

### 🌐 URL Management

- Add URLs for crawling
- Start and stop processing for each URL

### 📊 Results Dashboard

- Paginated and sortable table of analyzed URLs
- Column filters and global search functionality

### 🔍 Detail View

- Chart displaying internal vs. external links
- List of broken (4xx/5xx) links with status codes

### 🧩 Bulk Actions

- Select multiple URLs for re-analysis or deletion

### 🔁 Real-Time Status Updates

- Polling-based crawl progress: `queued → running → done / error`

---

## 📂 Project Structure

```bash
├── backend/            # Go server
│   ├── cmd/webcrawler/ # Main entry point
│   └── internal/       # Handlers, services, models, utils
├── frontend/           # React + Vite app
│   ├── src/            # Components, pages, services
│   └── tests/          # Frontend test cases
├── docker/             # (Optional) Init SQL or config files
├── docker-compose.yml  # Compose setup for backend, frontend, db
├── .env.example        # Sample environment file
└── README.md
```

## 🚀 Installation & Setup

**Clone the repo**

```bash
gh repo clone UmutAkturk14/web-crawler
```

**Add the environment variables (samples provided below)**

### Local

#### Back end

**Fetch the dependencies**

```bash
go mod download
```

**Run the app**

```bash
go run cmd/webcrawler/main.go
```

### Docker

From the root folder, run the Docker.

```bash
docker compose up --build
```

**Attention**
If you change the default host of the frontend `http//localhost:8088`, you should also change the CORS policies inside cmd/webcrawler/main.go file accordingly;

```Golang
// Enable CORS for localhost:8088
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"NEW_HOST_URL"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
```

---

## 🔐 Authentication

All API requests require an Authorization header:

```json
"Authorization": "Bearer <your-token>"
```

For demo purposes, the backend accepts a hardcoded or pre-generated JWT token (adjust via `.env`). You can use this token in your frontend requests.

---

## 🧪 Testing

This project includes comprehensive end-to-end tests for the frontend using **Playwright**. The tests cover essential user flows including authentication, URL management, dashboard interactions, and detailed view validations.

### Testing Tools & Setup

- **Framework:** Playwright

- **Test Runner:** Playwright Test

- **Languages:** TypeScript

- **Test Structure:**

  - `auth.spec.ts` — User registration, login, logout

  - `dashboardToolbar.spec.ts` — URL addition, crawling, bulk actions, detailed views

  - Helper functions in `helpers/` for reusable operations like login and URL actions

### Running Tests

1. Ensure your backend and frontend servers are running locally (default frontend at `http://localhost:8088`).

2. Install dependencies inside the `frontend` directory:

   ```bash
   cd frontend npm install
   ```

3. Run the Playwright tests:

   ```bash
   npm run test
   ```

   You can run tests with a headed browser (visible UI) for debugging:

   ```bash
   npx playwright test --headed
   ```

### Test Highlights

- **Authentication**
  Tests cover user registration, login, logout flows with token storage verification.

- **URL Management**
  Adding URLs, starting crawls, waiting for status updates, and verifying results.

- **Dashboard Actions**
  Bulk re-analyze and delete features, verifying UI responses and state changes.

- **Detailed View**
  Clicking on a URL entry opens a detailed panel showing URL info, broken links, headings, and metadata sections — all verified for visibility and correctness.

### Test Helpers

- `authenticateUser()` — Automates login and registration workflows.

- `addUrl()` — Adds URLs and verifies their presence.

- `startCrawlAndWait()` — Starts crawling and waits for completion status.

- Bulk operations like re-analyze and delete are abstracted for readability and reuse.

---

## 🧬 Database

- The project uses MySQL as the database engine.

- Upon startup (via Docker or manually), the schema is automatically created.

---

## 🔧 Environment Variables

Environment config is separated using `.env` files. Sample files are provided:

### `.env (Backend)

```.env
DB_USER=myuser
DB_PASSWORD=mypassword
DB_HOST=mysql
DB_PORT=3306
DB_NAME=crawler
```

### .env.local (Backend)

```bash
DB_USER=myuser
DB_PASSWORD=mypassword
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crawler
```

### `.env.example` (Frontend)

```.env
VITE_API_URL=http://localhost:8080
```

---

## 📄 License

This project is provided for evaluation purposes. You are free to reuse or open-source it.
