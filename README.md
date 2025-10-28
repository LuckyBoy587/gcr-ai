# GCR API Dashboard

A simple React-based UI to access the Google Container Registry (GCR) API and fetch your container details.

## Features

- 🔐 Secure environment-based configuration for API credentials
- 🎨 Modern, responsive UI built with React and Vite
- 📊 Configuration status display
- 🚀 Easy-to-use interface for fetching GCR details
- 🛡️ Secrets stored in `.env` file (not committed to version control)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Container Registry API credentials

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd gcr-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and configure your GCR API credentials:

```bash
cp .env.example .env
```

Edit the `.env` file and add your actual GCR API credentials:

```env
VITE_GCR_API_URL=https://gcr.io/v2
VITE_GCR_PROJECT_ID=your-actual-project-id
VITE_GCR_API_KEY=your-actual-api-key
VITE_GCR_SERVICE_ACCOUNT=your-service-account@your-project.iam.gserviceaccount.com
```

**Important:** Never commit the `.env` file to version control. It's already included in `.gitignore`.

### 4. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## How to Use

1. Ensure your `.env` file is properly configured with your GCR API credentials
2. Start the development server with `npm run dev`
3. Open the application in your browser
4. Check the "Configuration Status" section to verify all credentials are set
5. Click "Fetch GCR Details" to retrieve your container registry information
6. View the response data displayed on the page

## Project Structure

```
gcr-ai/
├── src/
│   ├── services/
│   │   └── gcrService.js    # GCR API integration
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application styles
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── .env.example             # Environment variables template
├── .env                     # Your actual credentials (not committed)
├── .gitignore               # Git ignore rules
└── package.json             # Project dependencies
```

## Security Notes

- 🔒 All API credentials are stored in the `.env` file
- 🚫 The `.env` file is excluded from version control via `.gitignore`
- ⚠️ Never commit API keys or secrets to the repository
- 🔑 Use service accounts with minimal required permissions
- 📝 Share `.env.example` as a template, not actual credentials

## Troubleshooting

### Configuration not detected
- Ensure you've copied `.env.example` to `.env`
- Verify all required environment variables are set
- Restart the development server after changing `.env` values

### API request fails
- Verify your API key is valid and has the necessary permissions
- Check that your project ID is correct
- Ensure your GCR API URL is correct for your setup
- Check browser console for detailed error messages

## Technologies Used

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **dotenv** - Environment variable management
- **ESLint** - Code quality and linting

## Contributing

Feel free to submit issues or pull requests to improve this project.

## License

This project is open source and available under the MIT License.

