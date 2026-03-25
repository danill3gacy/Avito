# Авито — Личный кабинет продавца

Веб-приложение личного кабинета продавца с интегрированным AI-ассистентом.

## Стек

- React 18 + TypeScript + Vite
- react-router-dom, Zustand, TanStack Query, Axios
- Anthropic Claude API (AI-функции)
- ESLint + Prettier

## Запуск

### 1. Backend
```bash
cd server && npm install && npm start
```

### 2. Настройка .env
```bash
cp .env.example .env
# Добавьте VITE_ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Frontend
```bash
npm install && npm run dev
# http://localhost:5173
```

### Docker Compose
```bash
docker compose up --build
```

## Функциональность

- `/ads` — список объявлений: поиск, фильтры по категории, переключатель "требует доработок", сортировка, пагинация (10/стр), grid/list layout
- `/ads/:id` — просмотр: характеристики по категории, блок незаполненных полей
- `/ads/:id/edit` — редактирование: динамические поля, валидация, автосохранение черновика в localStorage
- AI: "Улучшить описание", "Узнать рыночную цену", чат с контекстом объявления
- Тёмная тема (сохраняется в localStorage)

## Принятые решения

| Решение | Обоснование |
|---|---|
| Anthropic Claude API | Качественные ответы, удобная интеграция |
| Zustand вместо Redux | Меньше бойлерплейта для данного масштаба |
| CSS-переменные | Производительность, нативная тёмная тема |
| localStorage для черновиков | Простой способ без усложнения архитектуры |
