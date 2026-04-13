# 🌍 MyLocal - Microservices Recommendation Platform

![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?style=for-the-badge&logo=githubactions)
![Kubernetes](https://img.shields.io/badge/Deployment-Kubernetes-326CE5?style=for-the-badge&logo=kubernetes)
![GitOps](https://img.shields.io/badge/GitOps-ArgoCD-ef7b4d?style=for-the-badge&logo=argo)
![PHP](https://img.shields.io/badge/Backend-PHP%208.2-777BB4?style=for-the-badge&logo=php)
![Node](https://img.shields.io/badge/Frontend-Node.js-339933?style=for-the-badge&logo=nodedotjs)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)

Welcome to **MyLocal**, a modern, cloud-native local recommendation platform. This repository is engineered for maximum scalability, leveraging independent microservices, a declarative architecture, and a completely automated **GitOps** release lifecycle.

---

## 🏗️ System Architecture

The application is decomposed into five autonomous containerized services. To prevent data coupling, backend services independently manage their own dedicated databases.

| Service | Technology | Role | Database |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `PHP/Apache` | Centralized router & proxy | *None* |
| **Frontend** | `Node 20 / Nginx`| React + Vite Client Application | *None* |
| **User Service** | `PHP 8.2` | Authentication, Profiles & Identity | `user-database` (PG 16) |
| **Content Service** | `PHP 8.2` | Core recommendations & places logic | `content-database` (PG 16) |
| **Media Service** | `PHP 8.2` | Media handling and photo processing | `media-database` (PG 16) |

---

## 🔄 CI/CD & GitOps Pipeline

Deployment requires zero manual execution. This repository utilizes a fully autonomous **Push-and-Pull GitOps workflow**:

1. **Test Matrix (`GitHub Actions`)**: Code pushed to `main` triggers parallelized backend & frontend testing.
2. **Build & Push**: Upon test clearance, Docker images are securely built and pushed to Docker Hub, tagged with their unique git commit SHAs.
3. **Manifest Injection**: The CI Pipeline natively patches the YAML files inside the `/k8s` directory with the new image tags and automatically commits them back to `main`.
4. **ArgoCD Sync**: The Kubernetes cluster running **ArgoCD** continuously monitors the `/k8s` directory. It intercepts the tag update, diffs the state, and dynamically rolls over your cluster pods with zero downtime.

---

## 🚀 Running on Kubernetes (Production-Style)

Assuming you have a local cluster (like Minikube or K3s) and `kubectl` configured:

### 1. Configure the Infrastructure Secret
Make sure your security keys and database passwords are mapped. We keep this tracked outside the raw code dynamically:
```bash
kubectl apply -f k8s/secret.yaml
```

### 2. Standard Kubernetes Deployment
If not relying on ArgoCD locally, you can deploy the entire stack natively:
```bash
kubectl apply -f k8s/
```

### 3. Service Endpoints (NodePorts)
Once the pods initialize, the services will bind reliably to the following ports on your host Node IP:
- **Frontend UI**: `http://<node-ip>:30004`
- **Gateway**: `http://<node-ip>:30000`
- **User Service:** `http://<node-ip>:30001`
- **Content Service:** `http://<node-ip>:30002`
- **Media Service:** `http://<node-ip>:30003`

---

## 💻 Local Development (Quick Setup)

If you need to rapidly develop offline or independently without spinning up a Kubernetes cluster, you can utilize the unified Docker Compose stack:

```bash
# Build and stand up all services concurrently
docker-compose up -d --build
```
* **Frontend**: `http://localhost:3000`
* **Gateway**: `http://localhost:8000`
* **APIs**: Available on ports `8001`, `8002`, `8003`

To tear down the offline cluster and release the ports:
```bash
docker-compose down -v
```

---

*Architected with strictly typed configurations. Production-ready.*
