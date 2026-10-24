# Frontend

React + TypeScript + Vite.

```sh
npm install
npm run dev
```

Dev-сервер: http://localhost:5173. Запросы `/api` и `/metrics` проксируются на backend
(`http://localhost:8000`, можно переопределить через `VITE_BACKEND_URL`).

Стек: React Router, TanStack Query, Recharts, MSW для моков API.
