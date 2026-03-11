---
name: axios
description: >
  Axios HTTP client patterns and best practices.
  Trigger: When making HTTP requests with axios in .ts/.tsx files (API calls, interceptors, error handling, TypeScript generics).
license: Apache-2.0
metadata:
  author: jesusp
  version: "1.0"
  scope: [root, ui]
  auto_invoke: "Making HTTP requests with axios"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## When to Use

- Making HTTP requests (GET, POST, PUT, DELETE, PATCH)
- Configuring base URL and default headers
- Handling request/response interceptors
- TypeScript typing for API responses
- Error handling with typed errors

---

## API Instance (REQUIRED)

```typescript
// api/client.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## TypeScript Generics (REQUIRED)

```typescript
// ✅ ALWAYS: Define response types
interface User {
  id: string;
  name: string;
  email: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Generic GET
async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users");
  return data;
}

// Generic POST with response type
async function createUser(user: CreateUserDto): Promise<User> {
  const { data } = await api.post<User>("/users", user);
  return data;
}

// Generic PUT
async function updateUser(id: string, user: UpdateUserDto): Promise<User> {
  const { data } = await api.put<User>(`/users/${id}`, user);
  return data;
}

// Generic DELETE
async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
```

---

## Error Handling

```typescript
// Typed error handling
interface ApiError {
  message: string;
  code: string;
  status: number;
}

async function fetchData() {
  try {
    const response = await api.get<User>("/users");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message,
        code: error.code,
        status: error.response?.status || 0,
      };
      console.error("API Error:", apiError);
      throw apiError;
    }
    throw error;
  }
}
```

---

## Query Params

```typescript
interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "asc" | "desc";
}

async function getUsers(params: GetUsersParams) {
  const { data } = await api.get<User[]>("/users", { params });
  return data;
}

// Usage
getUsers({ page: 1, limit: 10, search: "john" });
```

---

## Concurrent Requests

```typescript
// Promise.all for parallel requests
async function getDashboardData() {
  const [users, products, orders] = await Promise.all([
    api.get<User[]>("/users"),
    api.get<Product[]>("/products"),
    api.get<Order[]>("/orders"),
  ]);

  return {
    users: users.data,
    products: products.data,
    orders: orders.data,
  };
}
```

---

## File Downloads

```typescript
async function downloadFile(url: string, filename: string) {
  const response = await api.get(url, {
    responseType: "blob",
  });

  const blob = new Blob([response.data]);
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
```

---

## Cancel Requests

```typescript
import { CancelToken } from "axios";

const cancelTokenSource = axios.CancelToken.source();

async function searchUsers(query: string) {
  const { data } = await api.get("/users/search", {
    params: { q: query },
    cancelToken: cancelTokenSource.token,
  });
  return data;
}

// Cancel request
cancelTokenSource.cancel("Search cancelled");
```

---

## Axios vs Fetch

| Feature | Axios | Fetch |
|---------|-------|-------|
| JSON transform | Automatic | Manual |
| Timeout | Built-in | Manual |
| Interceptors | Built-in | Manual |
| Cancel requests | Built-in | AbortController |
| Progress | Upload/Download events | Limited |

---

## Common Mistakes

```typescript
// ❌ NEVER: Using 'any'
const { data } = await api.get("/users"); // any

// ✅ ALWAYS: Type the response
const { data } = await api.get<User[]>("/users");

// ❌ NEVER: Not handling errors
await api.get("/users");

// ✅ ALWAYS: Try-catch
try {
  await api.get("/users");
} catch (error) {
  // Handle error
}

// ❌ NEVER: Hardcoded baseURL
const api = axios.create({ baseURL: "http://localhost:3000" });

// ✅ ALWAYS: Environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
```
