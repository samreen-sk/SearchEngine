# Realtime Web Page Search Engine

## API Endpoints

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/search` | Searches the web via Serper and returns ranked results with relevance score. |
| GET | `/api/search/history` | Returns the 10 most recent search queries. |
| GET | `/api/search/top` | Returns the 10 most frequent search queries. |
| GET | `/api/search/results?query=...` | Returns stored results for a given query from MySQL. |

### `POST /api/search`

Request body:
```json
{
  "query": "apple inc",
  "page": 0,
  "size": 10
}
```

Response (example):
```json
[
  {
    "pageId": 1,
    "url": "https://example.com",
    "title": "Example",
    "score": 1.0,
    "rank": 1
  }
]
```

### `GET /api/search/history`

Response (example):
```json
[
  {
    "id": 12,
    "queryText": "apple inc",
    "searchedAt": "2026-02-10T12:30:00"
  }
]
```

### `GET /api/search/top`

Response (example):
```json
[
  {
    "query": "apple inc",
    "count": 5
  }
]
```

### `GET /api/search/results?query=apple%20inc`

Response (example):
```json
[
  {
    "pageId": 1,
    "url": "https://example.com",
    "title": "Example",
    "score": 1.0,
    "rank": 1
  }
]
```

## Workflow

1. User opens the frontend at `/` and submits a search query.
2. The frontend sends `POST /api/search` with `query`, `page`, and `size`.
3. The backend forwards the query to Serper and receives ranked results.
4. For each result, the backend computes cosine similarity and a relevance score.
5. The backend stores the search query, web page, and ranking data in MySQL.
6. The backend returns the results to the frontend for display.
