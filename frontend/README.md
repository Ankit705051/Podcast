# PodcastHub Frontend

A modern React frontend for the PodcastHub platform, built with React, Tailwind CSS, and connected to a Node.js backend.

## Features

- **User Authentication**: Login, registration, and profile management
- **Subscription Management**: View and manage podcast subscriptions with Stripe integration
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Modern UI**: Clean, professional interface with smooth interactions
- **Protected Routes**: Authentication-based route protection
- **Toast Notifications**: User-friendly feedback system

## Tech Stack

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **React Hook Form**: Form handling with validation
- **React Hot Toast**: Notification system
- **Lucide React**: Icon library

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 3000

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd podcast/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```
REACT_APP_API_URL=http://localhost:3000/api/v1
```

5. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3001`.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Auth/           # Authentication components
│   └── Layout/         # Layout components
├── context/            # React context providers
├── pages/              # Page components
├── services/           # API service layer
├── App.jsx             # Main app component
├── index.css           # Global styles
└── index.js            # Entry point
```

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## API Integration

The frontend is designed to work with the backend API at `/api/v1`. The main API endpoints include:

- **Authentication**: `/users/*`
- **Subscriptions**: `/subscriptions/*`
- **Plans**: `/plans/*`
- **Payments**: `/payments/*`
- **Sessions**: `/sessions/*`

## Environment Variables

- `REACT_APP_API_URL`: Base URL for the backend API
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key (for payments)

## Features Overview

### Authentication
- User registration with email verification
- Login with remember me functionality
- Password reset functionality
- Protected routes for authenticated users

### Subscription Management
- View current subscription status
- Upgrade subscription plans
- Stripe payment integration
- Subscription history

### UI/UX
- Responsive design for all screen sizes
- Loading states and error handling
- Toast notifications for user feedback
- Smooth transitions and animations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `build` folder.

### Environment Setup for Production

Make sure to set the correct environment variables for your production environment.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your backend is configured to accept requests from the frontend URL
2. **API Connection**: Verify that the backend is running and accessible at the configured API URL
3. **Environment Variables**: Ensure all required environment variables are set

### Tailwind CSS Issues

If Tailwind classes are not working:
1. Ensure PostCSS is configured correctly
2. Check that `tailwind.config.js` is properly set up
3. Verify that `index.css` includes the Tailwind directives

## License

This project is licensed under the MIT License.
