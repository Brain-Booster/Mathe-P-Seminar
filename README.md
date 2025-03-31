# P-Seminar Project

A mathematics and 3D modeling project for school, built with Next.js.

## Project Structure

```
p-seminar/
│
├── public/              # Static assets
│   ├── images/          # Static images
│   ├── models/          # 3D models
│   ├── team/            # Team member images
│   └── uploads/         # User uploads
│
├── src/                 # All source code
│   │
│   ├── pages/           # Next.js pages
│   │   ├── api/         # API endpoints
│   │   ├── admin/       # Admin area
│   │   └── projects/    # Project pages
│   │
│   ├── components/      # React components
│   │   ├── common/      # Common UI components
│   │   ├── projects/    # Project-related components
│   │   ├── team/        # Team-related components
│   │   ├── admin/       # Admin-specific components
│   │   └── models/      # 3D model components
│   │
│   ├── styles/          # CSS styles
│   │   ├── modules/     # CSS modules
│   │   └── globals.css  # Global styles
│   │
│   ├── contexts/        # React context providers
│   ├── lib/             # Utility libraries
│   ├── hooks/           # Custom React hooks
│   └── config/          # Configuration files
│
├── data/                # Data storage
│
└── scripts/             # Utility scripts
```

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Features

- Admin dashboard for managing projects and team members
- Activity tracking for projects and team members
- 3D model viewer for displaying models
- Responsive design for mobile and desktop
- Dark/light theme support

## Development

### Environment Variables

Create a `.env.local` file based on `.env.example` to set up your environment variables.

### API Routes

The API routes are organized by resource type:

- `/api/projects` - Projects API
- `/api/team` - Team members API
- `/api/activities` - Activity tracking API
- `/api/uploads` - File upload API
- `/api/stats` - Statistics API

### Database

The project uses JSON files for data storage, located in the `data` directory:

- `projects.json` - Project data
- `team.json` - Team member data
- `activities.json` - Activity tracking data

## Deployment

Build the project for production:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm run start
# or
yarn start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.