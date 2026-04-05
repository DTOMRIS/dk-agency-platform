# Environment Setup

## News Pipeline

`NEWS_API_SECRET=<random-32-char-string>`

Bu secret `POST /api/news/fetch` və `POST /api/news/translate` endpoint-lərinə n8n və ya bənzəri webhook çağırışları üçün lazımdır. Production-da güclü, 32 simvolluq random dəyər istifadə edin.
