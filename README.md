# Library Management API 📚

A REST API to manage a library's books. Built with Node.js and Express as the final capstone project of my internship.

## Features
- Add, view, update and delete books
- Borrow and return books
- Filter books by author, availability, or search by title
- Input validation and proper error handling
- Request logging and a health check route

## Tech Stack
- Node.js
- Express.js
- Node built-in test runner

## Live Demo
https://YOUR-LINK.onrender.com

## Setup
1. Clone the repository
   ```
   git clone https://github.com/YOUR-USERNAME/library-api.git
   cd library-api
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Start the server
   ```
   npm start
   ```
4. Open http://localhost:3000

## Run Tests
```
npm test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/health` | Health check |
| GET | `/books` | Get all books |
| GET | `/books?author=paulo` | Filter by author |
| GET | `/books?available=true` | Filter by availability |
| GET | `/books?search=clean` | Search by title |
| GET | `/books/:id` | Get one book |
| POST | `/books` | Add a book |
| PUT | `/books/:id` | Update a book |
| PATCH | `/books/:id/borrow` | Borrow a book |
| PATCH | `/books/:id/return` | Return a book |
| DELETE | `/books/:id` | Delete a book |

## Sample Request
POST `/books`
```json
{
  "title": "Atomic Habits",
  "author": "James Clear",
  "year": 2018
}
```

## Error Responses
- `400` - Invalid data or invalid action (for example, borrowing a borrowed book)
- `404` - Book or route not found

## Project Structure
```
library-api/
├── server.js
├── test.js
├── package.json
├── .gitignore
└── README.md
```

## Note
Data is stored in memory, so it resets when the server restarts.

## Author
Nishanthini J