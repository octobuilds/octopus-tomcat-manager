<div align="center">
  <a href="https://octopusapm.com/">
    <img src="frontend/public/banner.png" alt="OctopusAPM" width="500" />
  </a>
  <br /><br />

  ![Docker Pulls](https://img.shields.io/docker/pulls/octobuilds/octopus-tomcat-manager?style=for-the-badge&logo=docker&color=2496ED)
  ![Docker Image Version](https://img.shields.io/docker/v/octobuilds/octopus-tomcat-manager?style=for-the-badge&logo=docker)
  ![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

  <p><b>A modern, Dockerized Application Performance Monitoring (APM) and management dashboard tailored specifically for Apache Tomcat servers.</b></p>
</div>

---



---


Octopus APM provides real-time log tailing, metric monitoring, automated background services, and an interactive setup wizard with a sleek React-based user interface.

## Features

- **Real-Time Monitoring:** Track CPU, Memory, and JVM metrics of your Tomcat instances live.
- **Interactive Setup Wizard:** No complicated configuration files. Just run the container and set up your database via the UI.
- **Live Log Tailing:** Read and search Tomcat logs (`catalina.out`, `localhost.log`, etc.) directly from your browser using WebSockets.
- **Role-Based Access Control:** Built-in `ADMIN` and `USER` roles for secure team collaboration.
- **Automated Alarms:** Set custom thresholds and receive alerts when resources are constrained.
- **Seamless Docker Integration:** Deploy anywhere in seconds with a single Docker Compose file.

## Quick Start (Docker)

You don't need to build the source code to use Octopus APM. Just use the pre-built Docker image.

1. Create a `docker-compose.yml` file on your server with the following content:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: octopus_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 1234
      POSTGRES_DB: apm_tool
    volumes:
      - pgdata:/var/lib/postgresql/data

  octopus-apm:
    image: octobuilds/octopus-tomcat-manager:latest
    container_name: octopus_apm_app
    restart: always
    ports:
      - "5000:5000" 
    environment:
      - PORT=5000
      - DB_USER=postgres
      - DB_PASS=1234
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=apm_tool
    depends_on:
      - postgres

volumes:
  pgdata:
```

2. Run the application:
```bash
docker-compose up -d
```

3. Open your browser and navigate to:
```
http://localhost:5000
```

## First Time Setup

When you launch the application for the first time, you will be greeted by the **Setup Wizard**.
- The database credentials will be pre-filled based on your `docker-compose.yml`.
- Simply click **Next** through the steps to initialize the database tables.
- At the end of the setup, your default **Admin Credentials** will be generated:
  - **Email:** `admin@octopusapm.com`
  - **Password:** `admin123`

*(Note: You will be prompted to change this password upon your first login for security reasons).*

## Tech Stack
- **Frontend:** React, Vite, TypeScript, Socket.io-client
- **Backend:** Node.js, Express, Prisma (PostgreSQL), Socket.io
- **Containerization:** Docker (Multi-stage Alpine builds)
