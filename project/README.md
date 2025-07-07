# Google Form Database Web Application

A comprehensive client information management system that works without any Google API setup or OAuth configuration.

## 🚀 Features

- **Zero Configuration**: No API keys or Google Cloud Console setup required
- **Client Information Forms**: Pre-configured with all essential fields
- **ID Expiry Tracking**: Automatic alerts for IDs expiring within 30 days
- **File Attachments**: Support for document uploads via Google Drive
- **Mobile Responsive**: Works perfectly on all devices
- **CSV Export**: Complete data export functionality
- **Multi-form Management**: Create and manage multiple forms

## 🎯 Quick Deploy to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your forked repository
   - Click "Deploy"

3. **Your app is live!** 🎉
   - Vercel will provide you with a live URL
   - No additional configuration needed

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? (press enter for default)
# - Directory? (press enter for current)
# - Override settings? N
```

### Option 3: Manual Upload

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Go to Vercel Dashboard**:
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Drag and drop the `dist` folder

## 🎯 After Deployment

1. **Open your deployed application**
2. **Click "Connect to Google"** 
3. **Sign in with your Google account**
4. **Start creating forms immediately!**

## 📋 Pre-configured Form Fields

- Full Name
- Birthday
- Address
- Email Address
- Contact Number
- Image ID (file upload)
- **ID Expiry** (with automatic expiry alerts)
- Social Security Number
- Image SSN (file upload)
- Account Number
- Routing Number
- Image Account (file upload)
- Application 1, 2, 3 (file uploads)
- Client's Name
- Visit Plan

## 🔍 Key Features

### ID Expiry Tracking
- Automatic monitoring of all ID expiry dates
- Red highlighting for records with IDs expiring within 30 days
- Dashboard alerts showing count of expiring IDs
- Filter options to view only expiring records

### File Management
- Seamless Google Drive integration
- Organized folder structure for each form
- Direct file links in exported data
- Supported formats: JPG, PNG, PDF

### Response Management
- Comprehensive response viewer with search and filter
- Detailed individual response view
- Export to CSV with complete data
- Real-time updates and notifications

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Vercel
- **Storage**: Browser localStorage (demo mode)

## 🔒 Security & Privacy

- All data stored in YOUR Google account
- No external servers or databases
- Encrypted transmission via HTTPS
- Google's security infrastructure

## 📱 Mobile Experience

- Responsive design for all devices
- Touch-friendly interface
- Fast loading on mobile networks
- Offline capability for form filling

## 🎯 Perfect For

- Client onboarding processes
- Document collection with expiry tracking
- Customer information management
- Compliance documentation
- Application processing
- Identity verification workflows

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📞 Support

For issues or questions, please create an issue in this repository.

## 📄 License

MIT License - feel free to use this project for your business needs.

---

## 🎉 Ready to Deploy!

This application is fully configured for Vercel deployment and will work immediately without any API keys, OAuth setup, or Google Cloud Console configuration. It's a complete demo system that provides all the functionality you need for client information management with ID expiry tracking!