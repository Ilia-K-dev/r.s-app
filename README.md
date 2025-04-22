# Receipt Scanner App

A comprehensive application for scanning receipts, managing inventory, and tracking spending.

## Features

- Document scanning and text extraction using OCR
- Data organization by store/vendor
- Product categorization and tracking
- Inventory management
- Price and spending analytics
- User authentication and data security

## Tech Stack

- **Frontend**: React, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Authentication
- **OCR**: Google Cloud Vision API

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Firebase project
- Google Cloud Vision API access

### Installation

1. Clone the repository
git clone https://github.com/Ilia-K-dev/r.s-app.git
cd receipt-scanner

2. Install dependencies for both client and server
Install server dependencies
cd server
npm install
Install client dependencies
cd ../client
npm install

3. Set up environment variables
- Create `.env` file in the server directory based on `.env.example`
- Create `.env` file in the client directory based on `.env.example`

4. Start the development server
Start server
cd server
npm run dev
Start client (in a separate terminal)
cd client
npm start

## Project Structure

- `client/` - React frontend application
- `server/` - Node.js/Express backend API
- `docs/` - Documentation

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
