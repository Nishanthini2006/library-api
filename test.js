// Tests for the Library API (uses Node's built-in test runner)
const { test, before, after } = require("node:test");
const assert = require("node:assert");
const app = require("./server");

let server;
let base;

// Start the app on a random free port before the tests
before(
  () =>
    new Promise((resolve) => {
      server = app.listen(0, () => {
        base = "http://localhost:" + server.address().port;
        resolve();
      });
    })
);

// Stop the app after all tests
after(() => {
  server.close();
  if (server.closeAllConnections) server.closeAllConnections();
});

// Helper: sends a request and returns { status, data }
async function call(method, path, body) {
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(base + path, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

test("GET / returns welcome message", async () => {
  const { status, data } = await call("GET", "/");
  assert.strictEqual(status, 200);
  assert.strictEqual(data, "Welcome to the Library API");
});

test("GET /health returns status ok", async () => {
  const { status, data } = await call("GET", "/health");
  assert.strictEqual(status, 200);
  assert.strictEqual(data.status, "ok");
});

test("GET /books returns all 3 books", async () => {
  const { status, data } = await call("GET", "/books");
  assert.strictEqual(status, 200);
  assert.strictEqual(data.length, 3);
});

test("GET /books?available=true returns only available books", async () => {
  const { data } = await call("GET", "/books?available=true");
  assert.strictEqual(data.length, 2);
  assert.ok(data.every((b) => b.available === true));
});

test("GET /books?author=paulo filters by author", async () => {
  const { data } = await call("GET", "/books?author=paulo");
  assert.strictEqual(data.length, 1);
  assert.strictEqual(data[0].title, "The Alchemist");
});

test("GET /books?search=clean searches by title", async () => {
  const { data } = await call("GET", "/books?search=clean");
  assert.strictEqual(data.length, 1);
  assert.strictEqual(data[0].title, "Clean Code");
});

test("GET /books/1 returns one book", async () => {
  const { status, data } = await call("GET", "/books/1");
  assert.strictEqual(status, 200);
  assert.strictEqual(data.title, "Wings of Fire");
});

test("GET /books/99 returns 404", async () => {
  const { status, data } = await call("GET", "/books/99");
  assert.strictEqual(status, 404);
  assert.strictEqual(data.message, "Book not found");
});

test("POST /books adds a new book", async () => {
  const { status, data } = await call("POST", "/books", {
    title: "Atomic Habits",
    author: "James Clear",
    year: 2018,
  });
  assert.strictEqual(status, 201);
  assert.strictEqual(data.id, 4);
  assert.strictEqual(data.available, true);
});

test("POST /books without title returns 400", async () => {
  const { status, data } = await call("POST", "/books", { author: "Someone" });
  assert.strictEqual(status, 400);
  assert.strictEqual(data.message, "Title is required");
});

test("POST /books with invalid year returns 400", async () => {
  const { status } = await call("POST", "/books", {
    title: "Test",
    author: "Tester",
    year: "abc",
  });
  assert.strictEqual(status, 400);
});

test("PUT /books/4 updates a book", async () => {
  const { status, data } = await call("PUT", "/books/4", {
    title: "Atomic Habits (Updated)",
    author: "James Clear",
    year: 2018,
  });
  assert.strictEqual(status, 200);
  assert.strictEqual(data.title, "Atomic Habits (Updated)");
});

test("PATCH /books/4/borrow borrows a book", async () => {
  const { status, data } = await call("PATCH", "/books/4/borrow");
  assert.strictEqual(status, 200);
  assert.strictEqual(data.available, false);
});

test("Borrowing an already borrowed book returns 400", async () => {
  const { status, data } = await call("PATCH", "/books/4/borrow");
  assert.strictEqual(status, 400);
  assert.strictEqual(data.message, "Book is already borrowed");
});

test("PATCH /books/4/return returns a book", async () => {
  const { status, data } = await call("PATCH", "/books/4/return");
  assert.strictEqual(status, 200);
  assert.strictEqual(data.available, true);
});

test("DELETE /books/4 deletes a book", async () => {
  const { status, data } = await call("DELETE", "/books/4");
  assert.strictEqual(status, 200);
  assert.strictEqual(data.message, "Book deleted");
});

test("Deleted book is not found anymore", async () => {
  const { status } = await call("GET", "/books/4");
  assert.strictEqual(status, 404);
});

test("Unknown route returns 404", async () => {
  const { status, data } = await call("GET", "/xyz");
  assert.strictEqual(status, 404);
  assert.strictEqual(data.message, "Route not found");
});