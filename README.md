# Real-Time Collaboration Backend — Google Docs Clone

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A real-time collaborative document editing backend inspired by Google Docs, built with **Node.js, Express.js, MongoDB, Mongoose, and Socket.IO**.

The project provides REST APIs for document management and authentication, along with real-time communication for collaborative editing, document sharing, live presence, cursor events, and revision history.

## Features

- **User Authentication** — Register and log in using email and password.
- **JWT Authorization** — Protect API endpoints and authenticate Socket.IO connections.
- **Password Security** — Hash passwords using bcrypt.
- **Document Management** — Create, retrieve, rename, list, and delete documents.
- **Real-Time Updates** — Broadcast document content changes through Socket.IO.
- **Document Sharing** — Share documents with registered users by email.
- **Role-Based Access Control** — Support owner, editor, and viewer roles.
- **Live Presence** — Track connected collaborators in document rooms.
- **Cursor Events** — Broadcast cursor information to other collaborators.
- **Revision History** — Store document content revisions and retrieve recent revision metadata.
- **MongoDB Integration** — Persist users, documents, and revisions.
- **Security Middleware** — Use Helmet, CORS configuration, request validation, and centralized error handling.
- **Docker Support** — Run the API and MongoDB using Docker Compose.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API and middleware |
| MongoDB | NoSQL database |
| Mongoose | MongoDB object modeling |
| Socket.IO | Real-time, bidirectional communication |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| Helmet | HTTP security headers |
| CORS | Cross-origin access configuration |
| dotenv | Environment configuration |
| Docker | Containerization |
| Nodemon | Development server auto-restart |

## Architecture

```text
Client Application (React or any Socket.IO client)
                    |
          REST API + Socket.IO
                    |
             Express / Node.js
              /             \
       Auth Middleware    Socket Server
              \             /
               MongoDB
             /    |     \
          Users Documents Revisions
```

The backend can be connected to a React frontend with a rich-text editor to build a complete collaborative document application.

## Project Structure

```text
realtime-collaboration-backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── document.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── documentAccess.js
│   │   └── error.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Document.js
│   │   └── Revision.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── document.routes.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── jwt.js
│   ├── app.js
│   ├── server.js
│   └── socket.js
├── test/
│   └── smoke.test.js
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) 20 or later
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or Docker Desktop
- npm (included with Node.js)
- Git (optional)

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/ajinkya029/realtime-collaboration-backend.git
cd realtime-collaboration-backend
```

Replace `YOUR_USERNAME` with your GitHub username and adjust the repository URL if necessary.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env`.

On Windows Command Prompt:

```cmd
copy .env.example .env
```

On macOS/Linux or Git Bash:

```bash
cp .env.example .env
```

Update `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/collab_docs
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5173
```

**Important:** Use a strong, unique JWT secret and never commit your `.env` file to GitHub.

### 4. Start MongoDB

Make sure your local MongoDB server is running and accessible at the configured connection URL.

### 5. Start the development server

```bash
npm run dev
```

The backend should now be available at:

- **API Base URL:** `http://localhost:5000`
- **Health Check:** `http://localhost:5000/api/health`

Expected health-check response:

```json
{
  "status": "ok",
  "service": "collaboration-backend"
}
```

### Available Scripts

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server with Nodemon |
| `npm start` | Start the production server |
| `npm test` | Run the included smoke test |

## Running with Docker

If Docker Desktop is installed and running, start the application and MongoDB with:

```bash
docker compose up --build
```

To stop the containers:

```bash
docker compose down
```

To stop the containers without deleting persisted database data, use the command above. To also remove the MongoDB volume, run `docker compose down -v` (this deletes the persisted database data).

**Security note:** Update the example JWT secret in `docker-compose.yml` before using the Docker setup outside local development.

## REST API Documentation

All document endpoints require a valid JWT access token, except the health check and authentication endpoints.

For protected endpoints, include this HTTP header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in | No |
| `GET` | `/api/auth/me` | Get current user details | Yes |

#### Register a User

`POST /api/auth/register`

Request body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "strongpassword123"
}
```

A successful registration returns a JWT token and basic user details.

#### Log In

`POST /api/auth/login`

Request body:

```json
{
  "email": "ada@example.com",
  "password": "strongpassword123"
}
```

The response includes the token to use for subsequent protected requests.

### Document Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check API health |
| `POST` | `/api/documents` | Create a document |
| `GET` | `/api/documents` | List accessible documents |
| `GET` | `/api/documents/:id` | Retrieve a document |
| `PATCH` | `/api/documents/:id` | Update document metadata, including title |
| `DELETE` | `/api/documents/:id` | Delete a document (owner only) |
| `POST` | `/api/documents/:id/share` | Add or update a collaborator |
| `DELETE` | `/api/documents/:id/share/:userId` | Remove a collaborator |
| `GET` | `/api/documents/:id/revisions` | List recent revision metadata |

#### Create a Document

`POST /api/documents`

```json
{
  "title": "Project Notes",
  "content": "Welcome to our collaborative workspace!"
}
```

#### Share a Document

`POST /api/documents/:id/share`

```json
{
  "email": "collaborator@example.com",
  "role": "editor"
}
```

Supported roles:

- `owner` — Full control over the document and its sharing settings.
- `editor` — Can edit document content and update the title.
- `viewer` — Can view the document but cannot edit it.

Only the owner can manage collaborators and delete the document. The user being invited must already have an account.

## Real-Time Collaboration with Socket.IO

The Socket.IO server authenticates connections using the JWT token supplied in the connection handshake.

### Connect to the Server

Example client connection:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "YOUR_JWT_TOKEN"
  }
});
```

Install the client package in your frontend project:

```bash
npm install socket.io-client
```

### Client-to-Server Events

| Event | Payload | Description |
|---|---|---|
| `document:join` | `{ documentId }` | Join a document room |
| `document:update` | `{ documentId, content, clientVersion? }` | Submit document content |
| `document:cursor` | `{ documentId, cursor }` | Broadcast cursor position |
| `document:leave` | `{ documentId }` | Leave a document room |

### Server-to-Client Events

| Event | Payload | Description |
|---|---|---|
| `document:joined` | `{ documentId, content, version, role }` | Initial document state and access role |
| `document:updated` | `{ documentId, content, version, updatedBy, updatedAt }` | Updated document content |
| `document:cursor` | `{ userId, name, cursor }` | Another user's cursor information |
| `presence:update` | `{ documentId, users }` | Current connected collaborators |
| `document:error` | `{ message }` | Report a collaboration error |

### Example: Join a Document

```javascript
socket.emit("document:join", {
  documentId: "YOUR_DOCUMENT_ID"
});

socket.on("document:joined", (document) => {
  console.log("Document content:", document.content);
  console.log("Access role:", document.role);
});
```

### Example: Update Document Content

```javascript
socket.emit("document:update", {
  documentId: "YOUR_DOCUMENT_ID",
  content: "Updated collaborative document content",
  clientVersion: 0
});

socket.on("document:updated", (update) => {
  console.log("New version:", update.version);
  console.log("Updated content:", update.content);
});
```

Listen for `document:error` to handle errors returned by the server.

**Implementation note:** The current implementation saves the complete document content and creates a revision for each accepted update. Debounce or throttle updates in the frontend to reduce database writes.

## Error Handling

The API returns JSON error messages for common issues, including:

- Missing or invalid authentication tokens
- Invalid document IDs
- Unauthorized document access
- Viewer attempts to edit documents
- Duplicate user registrations
- Invalid request data
- Missing documents and routes

Example:

```json
{
  "message": "Authentication required"
}
```

## Limitations and Future Improvements

This project provides the foundation for a real-time collaborative editing backend, but it is not yet a full Google Docs replacement.

Potential improvements include:

- Integrate **Yjs or another CRDT/OT engine** to handle concurrent edits without losing changes.
- Integrate a rich-text editor such as Tiptap or Lexical in a React frontend.
- Implement document comments, suggestions, and activity feeds.
- Add version restoration and document snapshots.
- Implement user invitations and shareable links.
- Add rate limiting, email verification, and password reset.
- Add automated integration tests and API documentation with Swagger.
- Use a Socket.IO Redis adapter for multi-instance deployments.
- Add operational logging, monitoring, and deployment configuration.

## Security Considerations

- Keep JWT secrets and database credentials out of source control.
- Configure allowed CORS origins explicitly.
- Use HTTPS in production.
- Add rate limiting and stricter request validation before public deployment.
- Consider limits on revision retention and document size.
- Use a CRDT/OT solution before relying on concurrent editing in production.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request describing the improvement.

## License

This project is currently a starter project without a verified license declaration. If you intend to publish it as open source, choose a license and add the corresponding `LICENSE` file. The badge at the top should match the license you actually select.

## 👨‍💻 Author

**Ajinkya Dhatrak**

GitHub: [ajinkya029](https://github.com/ajinkya029)

---

**Built with Node.js, Express.js, and MongoDB.**
