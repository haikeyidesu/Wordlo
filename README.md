# Wordlo - Dockerized Wordle Clone

## Quick Start

### Build and Run with Docker Compose
```bash
docker-compose up --build
```

The application will be available at `http://localhost:8080`

### Build and Run with Docker only
```bash
# Build the image
docker build -t wordlo .

# Run the container
docker run -d -p 8080:80 --name wordlo-container wordlo
```

## Stopping the Application

### Docker Compose
```bash
docker-compose down
```

### Docker only
```bash
docker stop wordlo-container
docker rm wordlo-container
```

## Architecture

- **Base Image**: nginx:alpine (lightweight, production-ready web server)
- **Port**: 8080 (mapped to container port 80)
- **Static Files**: index.html, style.css, index.js served directly by nginx

## Customization

To change the port, edit `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:80"
```
