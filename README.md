<div align="center">

<img src="https://raw.githubusercontent.com/eludum/proclogic_app/main/assets/proclogic.svg" alt="ProcLogic Logo" width="120" height="120">


</div>

# ProcLogic Frontend

> The first fully open source public tender platform - Frontend Application

ProcLogic is a comprehensive platform for managing and tracking public procurement tenders. This repository contains the frontend web application.

## Features

- **Tender Discovery**: Browse and search public procurement opportunities
- **Smart Notifications**: Get notified about relevant tenders matching your interests
- **AI-Powered Assistant**: Chat with an AI assistant to get insights about publications
- **Document Management**: Download and manage tender documents
- **Dashboard Analytics**: Track your saved publications and activity

## Prerequisites

- Node.js 18.x or higher
- pnpm (recommended) or npm
- A Clerk account for authentication (free tier available)
- Access to ProcLogic API (see [proclogic_api](../proclogic_api))

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/eludum/proclogic_app.git
cd proclogic_app
```

### 2. Install dependencies

```bash
pnpm install
# or
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
# Clerk Authentication (get from https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_URL=http://localhost:3000
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. Run the development server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for authentication | Yes | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key for server-side authentication | Yes | `sk_test_...` |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | Yes | `http://localhost:8000` |
| `NEXT_PUBLIC_URL` | Frontend application URL | Yes | `http://localhost:3000` |

## Available Scripts

- `pnpm dev` - Start development server on http://localhost:3000
- `pnpm build` - Build the production application
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint to check code quality

## Project Structure

```
proclogic_app/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (sidebar)/         # Pages with sidebar layout
│   │   │   ├── dashboard/     # Dashboard page
│   │   │   ├── publications/  # Publications browsing & detail
│   │   │   └── settings/      # User settings
│   │   ├── api/               # API routes (if any)
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── siteConfig.ts      # Site-wide configuration
│   ├── components/            # Reusable React components
│   │   └── ui/               # UI primitives (buttons, dialogs, etc.)
│   ├── lib/                   # Utility functions and helpers
│   └── middleware.ts          # Next.js middleware (auth, etc.)
├── public/                    # Static assets
├── .env.local                 # Environment variables (not in git)
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## Building for Production

### Build the application

```bash
pnpm build
```

### Start production server

```bash
pnpm start
```

### Docker Deployment

Build the Docker image:

```bash
docker build -t proclogic-app .
```

Run the container:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key \
  -e CLERK_SECRET_KEY=your_secret \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com \
  -e NEXT_PUBLIC_URL=https://app.yourdomain.com \
  proclogic-app
```

### Kubernetes Deployment

ProcLogic can be deployed to Kubernetes. Example deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: proclogic-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: proclogic-app
  template:
    metadata:
      labels:
        app: proclogic-app
    spec:
      containers:
      - name: proclogic-app
        image: your-registry/proclogic-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_BASE_URL
          value: "https://api.yourdomain.com"
        - name: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
          valueFrom:
            secretKeyRef:
              name: proclogic-secrets
              key: clerk-publishable-key
        - name: CLERK_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: proclogic-secrets
              key: clerk-secret-key
```

See the deployment documentation for more details on production deployment strategies.

## Development Guidelines

### Code Style

This project uses:
- **Prettier** for code formatting
- **ESLint** for code linting
- **TypeScript** for type safety

Run linting:
```bash
pnpm lint
```

### Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for all new components
- Follow the existing folder structure
- Use Radix UI primitives for accessibility

### State Management

- Use SWR for server state and data fetching
- Use React hooks (useState, useContext) for local state
- Minimize prop drilling with proper component composition

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure code passes linting
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [proclogic_api](https://github.com/eludum/proclogic_api) - Backend API

## Support

- Issues: [GitHub Issues](https://github.com/eludum/proclogic_app/issues)
- Email: info@proclogic.be

---

<div align="center">

<a href="https://koselogic.be" target="_blank">
  <img src="https://raw.githubusercontent.com/eludum/proclogic_app/main/assets/koselogic.svg" alt="KoseLogic" width="200">
</a>




**[koselogic.be](https://koselogic.be)**

ProcLogic is developed by KoseLogic

</div>
