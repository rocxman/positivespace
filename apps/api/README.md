# PositiveSpace API

AI-Powered Music Generation Platform Backend

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI: http://localhost:8000/openapi.json

## Project Structure

```
app/
├── api/           # API routes
├── core/          # Core configuration
├── db/            # Database setup
├── models/        # SQLAlchemy models
├── schemas/       # Pydantic schemas
├── services/      # Business logic
└── tasks/        # Celery tasks
```

## Environment Variables

See `.env.example` for all required variables.
