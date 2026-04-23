# 🌍 MyLocal+ — Microservices Local Recommendation Platform

[![CI/CD Pipeline](https://github.com/FatmaMejri1/MyLocal-Microservices-Based-Local-Recommendation-Platform/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/FatmaMejri1/MyLocal-Microservices-Based-Local-Recommendation-Platform/actions)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![ArgoCD](https://img.shields.io/badge/GitOps-ArgoCD-EF7B4D?style=flat-square&logo=argo&logoColor=white)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![PHP](https://img.shields.io/badge/Backend-PHP%208.2-777BB4?style=flat-square&logo=php&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-4169E1?style=flat-square&logo=postgresql&logoColor=white)

---

## 📖 Project Overview

**MyLocal+** is a cloud-native, microservices-based local recommendation platform that helps users discover places, businesses, and services in their area. Built with scalability and maintainability as core principles, the platform decomposes its functionality into independent, loosely coupled services — each owning its domain logic and database.

The project demonstrates a **production-grade DevOps workflow**:
- Independent microservices communicating via **REST APIs**
- Secure **JWT authentication** with **Role-Based Access Control (RBAC)**
- Fully automated **CI/CD pipeline** with GitHub Actions
- **GitOps-oriented deployment** using Argo CD and Kubernetes (K3s)
- Complete container lifecycle from development to production

---

## 🏗️ Microservices Architecture

The system is decomposed into **5 autonomous containerized services**, each with its own responsibility and isolated database to prevent data coupling.

```
                        ┌─────────────────────┐
                        │   React Frontend     │
                        │   (Node 20 / Nginx)  │
                        │   Port: 3000 / 30004 │
                        └──────────┬──────────┘
                                   │ HTTP
                                   ▼
                        ┌─────────────────────┐
                        │    API Gateway       │
                        │   (PHP / Apache)     │
                        │   Port: 8000 / 30000 │
                        └──────┬──────┬───┬───┘
                               │      │   │
              ┌────────────────┘      │   └─────────────────┐
              │                       │                      │
              ▼                       ▼                      ▼
   ┌─────────────────┐   ┌──────────────────────┐   ┌──────────────────┐
   │  User Service   │   │   Content Service    │   │  Media Service   │
   │  (PHP 8.2)      │   │   (PHP 8.2)          │   │  (PHP 8.2)       │
   │  Port: 30001    │   │   Port: 30002        │   │  Port: 30003     │
   └────────┬────────┘   └──────────┬───────────┘   └────────┬─────────┘
            │                       │                         │
            ▼                       ▼                         ▼
   ┌─────────────────┐   ┌──────────────────────┐   ┌──────────────────┐
   │  user-database  │   │   content-database   │   │  media-database  │
   │  PostgreSQL 16  │   │   PostgreSQL 16      │   │  PostgreSQL 16   │
   │  PVC: 1Gi       │   │   PVC: 1Gi           │   │  PVC: 1Gi        │
   └─────────────────┘   └──────────────────────┘   └──────────────────┘
```

### Service Responsibilities

| Service | Technology | Responsibility | Database |
|:--------|:-----------|:---------------|:---------|
| **API Gateway** | PHP / Apache | Single entry point, request routing & proxying | None |
| **Frontend** | React + Vite / Nginx | User interface, client-side rendering | None |
| **User Service** | PHP 8.2 / Symfony | Authentication, JWT, RBAC, user profiles | `user-database` (PostgreSQL 16) |
| **Content Service** | PHP 8.2 / Symfony | Recommendations, places, business listings | `content-database` (PostgreSQL 16) |
| **Media Service** | PHP 8.2 / Symfony | Media uploads, photo processing & storage | `media-database` (PostgreSQL 16) |

---

## 🔐 Security

- **JWT Authentication** — stateless token-based auth across all services
- **RBAC** — role-based access control (`admin`, `user` roles)
- **Environment Variables** — all secrets managed via `.env` files, never committed to Git
- **Database Isolation** — each service has its own dedicated database, preventing cross-service data leaks

---

## 🔄 CI/CD Pipeline

The pipeline is fully automated — **zero manual deployment steps** after a code push.

```
  Developer pushes code to main
                │
                ▼
  ┌─────────────────────────────────────────┐
  │           STAGE 1: TEST                 │
  │           (Runs in Parallel)            │
  │                                         │
  │  ✅ Test Gateway                        │
  │  ✅ Test User Service                   │
  │  ✅ Test Content Service                │
  │  ✅ Test Media Service                  │
  │  ✅ Test Frontend                       │
  └──────────────────┬──────────────────────┘
                     │ All tests pass
                     ▼
  ┌─────────────────────────────────────────┐
  │        STAGE 2: BUILD & PUSH            │
  │           (Runs in Parallel)            │
  │                                         │
  │  🐳 Build & Push gateway:sha            │
  │  🐳 Build & Push user-service:sha       │
  │  🐳 Build & Push content-service:sha    │
  │  🐳 Build & Push media-service:sha      │
  │  🐳 Build & Push frontend:sha           │
  │                                         │
  │  → Tagged with git commit SHA           │
  │  → Pushed to Docker Hub                 │
  └──────────────────┬──────────────────────┘
                     │ All builds pass
                     ▼
  ┌─────────────────────────────────────────┐
  │        STAGE 3: GITOPS UPDATE           │
  │                                         │
  │  📝 Patch k8s/*.yaml with new SHA tags  │
  │  📤 Commit & push to main               │
  │     [skip ci] — prevents loop           │
  └──────────────────┬──────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────┐
  │        STAGE 4: ARGO CD SYNC            │
  │           (Automatic / Pull-based)      │
  │                                         │
  │  👁️  ArgoCD detects manifest change     │
  │  🔀  Diffs desired vs actual state      │
  │  🚀  Rolling update — zero downtime     │
  │  ✅  Cluster reaches desired state      │
  └─────────────────────────────────────────┘
```

### Pipeline Features
- **Parallel testing** with `fail-fast: false` — all services tested independently
- **SHA-based image tagging** — every deployment is traceable and rollback-ready
- **`[skip ci]`** on GitOps commit — prevents infinite pipeline loops
- **Explicit write permissions** — `contents: write` for the GitHub Actions bot

---

## ☸️ Kubernetes Deployment

The platform runs on **K3s** (lightweight Kubernetes), with all resources declared as YAML manifests in the `/k8s` directory.

### Kubernetes Resources

```
k8s/
├── namespace.yaml          # mylocal namespace
├── gateway.yaml            # Deployment + NodePort Service
├── user-service.yaml       # Deployment + NodePort Service
├── content-service.yaml    # Deployment + NodePort Service
├── media-service.yaml      # Deployment + NodePort Service
├── frontend.yaml           # Deployment + NodePort Service
├── user-database.yaml      # Deployment + ClusterIP + PVC (1Gi)
├── content-database.yaml   # Deployment + ClusterIP + PVC (1Gi)
├── media-database.yaml     # Deployment + ClusterIP + PVC (1Gi)
└── argocd-app.yaml         # ArgoCD Application manifest
```

### NodePort Mapping

| Service | Internal Port | NodePort |
|---------|:-------------|:---------|
| Gateway | 80 | 30000 |
| User Service | 80 | 30001 |
| Content Service | 80 | 30002 |
| Media Service | 80 | 30003 |
| Frontend | 80 | 30004 |
| Databases | 5432 | ClusterIP only (internal) |

---

## 🔁 GitOps with Argo CD

**Argo CD** implements the GitOps pattern by continuously reconciling the live cluster state with the desired state declared in this Git repository.

```
  Git Repository (Source of Truth)
         │
         │  ArgoCD watches /k8s directory
         │  and auto-syncs every change
         ▼
  ┌──────────────────────────────┐
  │           Argo CD            │
  │                              │
  │  Desired State (from Git)    │  ←── k8s/*.yaml
  │           ↕ diff             │
  │  Actual State (in cluster)   │  ←── Live Kubernetes
  │                              │
  │  → Auto-sync enabled         │
  │  → Self-heal enabled         │
  │  → Prune enabled             │
  └──────────────┬───────────────┘
                 │
                 ▼
       Kubernetes Cluster
         auto-updated
```

### Accessing Argo CD UI
```bash
# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Access at:
https://<node-ip>:31201
# Username: admin
```

---

## 🚀 How to Run the Project

### Option 1 — Local Development with Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/FatmaMejri1/MyLocal-Microservices-Based-Local-Recommendation-Platform.git
cd MyLocal-Microservices-Based-Local-Recommendation-Platform

# 2. Start all services
docker compose up -d --build

# 3. Check all containers are running
docker compose ps
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Gateway | http://localhost:8000 |
| User Service | http://localhost:8001 |
| Content Service | http://localhost:8002 |
| Media Service | http://localhost:8003 |

```bash
# Stop and clean up
docker compose down -v
```

---

### Option 2 — Kubernetes with K3s

```bash
# 1. Install K3s
curl -sfL https://get.k3s.io | sh -

# 2. Configure kubectl
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $USER:$USER ~/.kube/config

# 3. Verify cluster
kubectl get nodes

# 4. Deploy all services
kubectl apply -f k8s/

# 5. Watch pods start
kubectl get pods -n mylocal -w
```

| Service | URL |
|---------|-----|
| Frontend | http://\<node-ip\>:30004 |
| Gateway | http://\<node-ip\>:30000 |
| User Service | http://\<node-ip\>:30001 |
| Content Service | http://\<node-ip\>:30002 |
| Media Service | http://\<node-ip\>:30003 |

---

### Option 3 — Full GitOps with Argo CD

```bash
# 1. Install Argo CD
kubectl create namespace argocd
kubectl apply -n argocd -f \
  https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 2. Expose Argo CD UI
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'

# 3. Deploy Argo CD Application
kubectl apply -f k8s/argocd-app.yaml

# 4. Check sync status
kubectl get application -n argocd
```

From this point, every `git push` to `main` triggers the full pipeline and auto-deploys to the cluster — no manual steps needed.

---

## 📁 Project Structure

```
MyLocal-Microservices-Based-Local-Recommendation-Platform/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml              # GitHub Actions pipeline
│
├── k8s/                           # Kubernetes manifests
│   ├── namespace.yaml
│   ├── gateway.yaml
│   ├── user-service.yaml
│   ├── content-service.yaml
│   ├── media-service.yaml
│   ├── frontend.yaml
│   ├── user-database.yaml
│   ├── content-database.yaml
│   ├── media-database.yaml
│   └── argocd-app.yaml
│
├── user-service/                  # User microservice (Symfony)
├── content-service/               # Content microservice (Symfony)
├── media-service/                 # Media microservice (Symfony)
├── mylocal-frontend/              # React frontend
├── src/                           # API Gateway source
├── compose.yaml                   # Docker Compose stack
├── Dockerfile                     # Gateway Dockerfile
├── LICENSE                        # MIT License
└── README.md
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Backend Framework | Symfony (PHP 8.2) |
| Frontend Framework | React + Vite |
| API Style | REST APIs |
| Authentication | JWT + RBAC |
| Database | PostgreSQL 16 |
| Containerization | Docker + Docker Compose |
| Orchestration | Kubernetes (K3s) |
| CI/CD | GitHub Actions |
| GitOps | Argo CD |
| Image Registry | Docker Hub |
| API Testing | Postman |

---

## 🐳 Docker Images

All images are published to Docker Hub under `fatma111/`:

| Image | Tag |
|-------|-----|
| `fatma111/mylocal-gateway` | `latest` / `<git-sha>` |
| `fatma111/mylocal-user-service` | `latest` / `<git-sha>` |
| `fatma111/mylocal-content-service` | `latest` / `<git-sha>` |
| `fatma111/mylocal-media-service` | `latest` / `<git-sha>` |
| `fatma111/mylocal-frontend` | `latest` / `<git-sha>` |

---

## 👩‍💻 Author

**Fatma Mejri**
GitHub: [@FatmaMejri1](https://github.com/FatmaMejri1)

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
All rights reserved © 2026 Fatma Mejri.
