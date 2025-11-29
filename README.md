# AI RAG Cloud

A comprehensive Retrieval-Augmented Generation (RAG) system built with Flask and React that enables intelligent document processing and AI-powered question answering. This application combines advanced document parsing, semantic search, and generative AI to provide context-aware responses from user-uploaded documents.

## 🌟 Features

### Core Functionality
- **Document Upload & Processing**: Upload PDF, DOCX, TXT, and other document formats for intelligent parsing
- **Intelligent Document Parsing**: Automatic extraction and structuring of document content using Google's Gemini API
- **Semantic Search**: Retrieve relevant document chunks using vector embeddings with Chroma DB
- **RAG-Powered Chat**: Ask questions and get answers grounded in your uploaded documents
- **Multi-Model Support**: Support for multiple LLM models with user-configurable settings
- **Chat History**: Track and manage all conversations with documents

### User Management
- **Secure Authentication**: JWT-based authentication with Flask-JWT-Extended
- **User Profiles**: Manage user information and LLM preferences
- **Custom API Keys**: Users can configure their own API keys for different LLM providers
- **Personalized Workspace**: Each user has isolated document and chat history

### Frontend Features
- **Modern React UI**: Built with React 19 and Vite for fast development
- **Responsive Design**: Tailwind CSS for beautiful, responsive layouts
- **Real-time Chat Interface**: Interactive chat UI with markdown support
- **Document Management**: Browse, upload, and manage documents
- **LLM Settings**: Configure model parameters and API keys
- **Authentication**: Secure login and registration system

## 🏗️ Architecture

### Technology Stack

**Backend**
- **Framework**: Flask 3.0.3
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: Flask-JWT-Extended
- **Vector DB**: ChromaDB for semantic search
- **LLM Integration**: Google Generative AI (Gemini)
- **Document Processing**: LangChain, pdfplumber, pdf2image
- **API**: RESTful API with Flask-CORS

**Frontend**
- **Framework**: React 19.1
- **Build Tool**: Vite 7.1
- **Styling**: Tailwind CSS 3.4
- **HTTP Client**: Axios
- **State Management**: Zustand
- **Routing**: React Router 7.9
- **UI Libraries**: Lucide React Icons, React Markdown

**Infrastructure**
- **Containerization**: Docker (Multi-stage build)
- **Server**: Gunicorn with 300s timeout for LLM calls
- **Python**: 3.12-slim

### Project Structure

```
AI_RAG_Cloud/
├── app/                           # Backend Flask application
│   ├── models/                    # Database models
│   │   ├── user.py               # User model with LLM settings
│   │   ├── document.py           # Document model with user relationship
│   │   └── chat_history.py       # Chat history tracking
│   ├── routes/                   # API endpoints
│   │   ├── user_routes.py        # User authentication & profile
│   │   ├── document_routes.py    # Document upload & processing
│   │   ├── document_db_routes.py # Document storage endpoints
│   │   ├── rag_routes.py         # Question answering endpoints
│   │   └── chat_history_routes.py# Chat history retrieval
│   ├── services/                 # Business logic
│   │   ├── parsing_service.py    # Document parsing with LLMs
│   │   ├── chunking_service.py   # Text splitting & chunking
│   │   ├── embedding_service.py  # Vector embedding generation
│   │   ├── rag_service.py        # RAG pipeline orchestration
│   │   ├── retrieval_service.py  # Document retrieval & search
│   │   ├── llm_service.py        # LLM integration (lazy-loaded)
│   │   ├── user_service.py       # User profile management
│   │   ├── document_service.py   # Document CRUD operations
│   │   ├── vectorstore_service.py# Vector store management
│   │   ├── text_extraction_service.py # Extract text from PDFs
│   │   └── treatment_pipeline_service.py # Full processing pipeline
│   ├── schemas/                  # Marshmallow schemas for validation
│   │   ├── user_schema.py
│   │   └── document_schema.py
│   ├── db/                       # Database files
│   │   ├── chroma_db/           # Vector database
│   │   └── instance/            # SQLite database
│   ├── config.py                 # Flask configuration
│   ├── extentions.py            # Flask extensions initialization
│   ├── requirements.txt          # Python dependencies
│   └── __init__.py              # Flask app factory
├── frontend/                      # React application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ChatInterface.jsx    # Chat UI component
│   │   │   ├── DocumentUpload.jsx   # File upload
│   │   │   ├── DocumentList.jsx     # Document browser
│   │   │   ├── LLMSettingsModal.jsx # Model configuration
│   │   │   ├── ChatHistory.jsx      # Conversation history
│   │   │   ├── ProtectedRoute.jsx   # Auth guard
│   │   │   └── layout/              # Layout components
│   │   ├── pages/               # Page components
│   │   │   ├── ChatPage.jsx
│   │   │   ├── DocumentsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── HomePage.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios API client
│   │   ├── stores/
│   │   │   └── authStore.js     # Zustand auth store
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── Dockerfile                     # Multi-stage Docker build
├── run.py                        # Flask app entry point
└── INTEGRATION_GUIDE.md          # Deployment guide
```

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose (for containerized deployment)
- Python 3.12+ (for local development)
- Node.js 20+ (for frontend development)
- Google Gemini API Key (required for LLM features)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/SEKALDouaa/CloudRAG.git
   cd CloudRAG
   ```

2. **Build the Docker image**
   ```bash
   docker build -t ai_rag_cloud:latest .
   ```

3. **Run the container**
   ```bash
   docker run --name ai_rag_cloud \
     -p 5000:5000 \
     -e JWT_SECRET_KEY='your-secret-key-change-in-production' \
     -e GEMINI_API_KEY='your-gemini-api-key' \
     ai_rag_cloud:latest
   ```

4. **Access the application**
   - Frontend: http://localhost:5000
   - API: http://localhost:5000/api

### Local Development Setup

#### Backend Setup
```bash
cd app
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export JWT_SECRET_KEY='dev-secret-key'
export GEMINI_API_KEY='your-gemini-api-key'

# Run the Flask app
cd ..
python run.py
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Development server at http://localhost:5173
```

For production build:
```bash
npm run build
npm run preview
```

## 🔐 Environment Variables

### Backend (.env or environment)
```env
# Security
JWT_SECRET_KEY=your-strong-secret-key-here
SECRET_KEY=your-secret-key

# LLM Configuration
GEMINI_API_KEY=your-google-gemini-api-key

# Database (optional, auto-configured)
DATABASE_URL=sqlite:///app/db/instance/resumes.db
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/register` - Register new user
- `POST /api/login` - User login (returns JWT token)
- `GET /api/user-profile` - Get user profile (requires JWT)
- `PUT /api/update-profile` - Update user profile

### Document Management
- `POST /api/upload-document` - Upload and process document
- `GET /api/documents` - List user's documents
- `DELETE /api/delete-document/<doc_id>` - Delete document
- `GET /api/document/<doc_id>` - Get document details

### RAG & Chat
- `POST /api/ask` - Ask question about documents (requires JWT)
- `GET /api/chat-history` - Get user's chat history
- `DELETE /api/chat-history/<history_id>` - Delete chat history entry

### LLM Configuration
- `GET /api/user-llm` - Get user's LLM settings
- `POST /api/user-llm` - Configure LLM settings

## 🔄 Processing Pipeline

1. **Document Upload** → PDF/DOCX files uploaded by user
2. **Text Extraction** → Extract text using pdfplumber/text extraction services
3. **Intelligent Parsing** → Use Gemini API to structure document into RAG-compliant format
4. **Text Chunking** → Split document into semantic chunks (max 3000 tokens)
5. **Embedding Generation** → Create vector embeddings for each chunk
6. **Vector Storage** → Store embeddings in ChromaDB for fast retrieval
7. **Query Processing** → User questions are embedded and searched
8. **Retrieval** → Fetch top-5 relevant chunks using semantic similarity
9. **Generation** → Gemini API generates answer based on retrieved context
10. **Response** → Answer delivered with source documents cited

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured CORS headers
- **Password Hashing**: Bcrypt for secure password storage
- **SQL Injection Prevention**: SQLAlchemy ORM prevents SQL injection
- **Data Isolation**: Each user's data is isolated and access-controlled
- **Lazy API Key Loading**: API keys loaded on-demand to prevent startup failures
- **Long Request Timeout**: 300-second timeout for LLM API calls

## ⚙️ Configuration

### LLM Settings (User-Configurable)
Users can configure:
- **LLM Model**: Choose from available Gemini models
- **API Key**: Use personal API key or default
- **Temperature**: Control response creativity (0.0-1.0)
- **Max Tokens**: Limit response length

### Application Configuration
Edit `app/config.py` to modify:
- JWT expiration time
- Database location
- Token timeouts

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY not found"
**Solution**: The API key is lazy-loaded. Provide it via environment variable:
```bash
docker run -e GEMINI_API_KEY='your-key' ...
# OR
export GEMINI_API_KEY='your-key'
```

### Issue: Worker timeout errors
**Solution**: The Dockerfile already includes a 300-second timeout. For longer operations, rebuild:
```bash
docker build -t ai_rag_cloud:latest .
```

### Issue: Database locked errors
**Solution**: Restart the container:
```bash
docker restart ai_rag_cloud
```

### Issue: Frontend not loading
**Solution**: Ensure VITE_API_URL points to correct backend:
```env
VITE_API_URL=http://your-backend-url:5000
```

## 📊 Database Schema

### Users Table
- `email` (PK): User email
- `prenom`: First name
- `nom`: Last name
- `password`: Bcrypt hashed password
- `numeroTel`: Phone number
- `dateNaissance`: Birth date
- `llm_model`: Preferred LLM model
- `api_key`: User's API key

### Documents Table
- `id` (PK): Document UUID
- `file_name`: Original filename
- `file_data`: Binary file content
- `mime_type`: File MIME type
- `document_type`: Auto-detected type (PDF, DOCX, etc.)
- `user_email` (FK): Owner's email
- `metadata`: Document metadata (author, date, etc.)

### Chat History Table
- `id` (PK): Chat entry UUID
- `user_email` (FK): User who initiated chat
- `question`: User's question
- `answer`: LLM's response
- `sources`: Referenced document chunks

### Vector Database (ChromaDB)
- Stores embeddings for semantic search
- Organized by user for data isolation
- Contains chunk text and metadata

## 🚀 Deployment

### Docker Compose (Recommended)
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  ai_rag_cloud:
    build: .
    ports:
      - "5000:5000"
    environment:
      JWT_SECRET_KEY: your-production-secret
      GEMINI_API_KEY: your-gemini-api-key
    volumes:
      - ./app/db:/app/app/db
```

Run with:
```bash
docker-compose up -d
```

### Cloud Deployment
- **AWS**: ECS, EC2, or Lambda
- **GCP**: Cloud Run, Compute Engine
- **Azure**: App Service, Container Instances
- **Heroku**: Deploy with Procfile

See `INTEGRATION_GUIDE.md` for detailed deployment instructions.

## 📝 Development

### Code Style
- Python: PEP 8 compliant
- JavaScript: ESLint configured in `frontend/eslint.config.js`
- Use type hints in Python

### Testing
Run tests:
```bash
# Backend tests
pytest app/

# Frontend tests
cd frontend && npm test
```

### Building for Production
```bash
# Backend
pip install -r app/requirements.txt

# Frontend
cd frontend
npm install
npm run build

# Docker
docker build -t ai_rag_cloud:production .
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the INTEGRATION_GUIDE.md for deployment help

## 🎯 Roadmap

- [ ] Support for additional LLM providers (OpenAI, Claude)
- [ ] Advanced document analytics and insights
- [ ] Real-time collaboration features
- [ ] Mobile app (iOS/Android)
- [ ] Advanced caching and performance optimization
- [ ] Multi-language support
- [ ] Document versioning and change tracking

## ✨ Acknowledgments

- Built with [Flask](https://flask.palletsprojects.com/)
- Frontend powered by [React](https://react.dev/)
- LLM integration via [Google Generative AI](https://ai.google.dev/)
- Vector embeddings with [ChromaDB](https://www.trychroma.com/)
- RAG framework using [LangChain](https://www.langchain.com/)

---

**Made with ❤️ by the CloudRAG Team**
