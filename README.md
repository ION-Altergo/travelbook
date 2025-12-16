# Travelbook - Engineering Trip Planner

A modern, lean web application for managing on-site engineering trips, tracking expenses, and generating customer reports. Built with Next.js 15, TypeScript, and shadcn/UI with a Linear-inspired design.

## ✨ Features

### 🔐 Authentication & Teams
- **Google OAuth**: Secure login with company Google accounts
- **Team Management**: Automatic team assignment based on email domain
- **Smart Defaults**: Current user auto-selected when creating trips
- **Team Filtering**: Only see engineers and data from your organization

### 📊 Dashboard
- **Visual Timeline**: Month-by-month visualization of engineer assignments
- **Quick Stats**: Overview of trips, active engineers, and expenses
- **Upcoming Trips**: List of scheduled and in-progress trips
- **Color-coded Engineers**: Easy visual identification of team members

### ✈️ Trip Planning
- **Trip Management**: Create, view, and manage on-site trips
- **Status Tracking**: Plan, confirm, track in-progress, and complete trips
- **Advanced Filtering**: Search by project, engineer, status
- **Duration & Cost Estimates**: Automatic calculation of trip costs

### 💰 Expense Tracking
- **Expense Categories**: Travel, accommodation, meals, transportation, and more
- **Multi-currency Support**: EUR, USD, INR, GBP
- **Trip Association**: Link expenses to specific trips and engineers
- **Real-time Totals**: Instant calculation of expense summaries

### 👥 Engineer Management
- **Team Overview**: View all engineers with their stats
- **Performance Metrics**: Track days on-site per engineer
- **Revenue Estimation**: Calculate revenue based on daily rates
- **Availability Status**: See who's active, upcoming, or available

### 📈 Reports & Analytics
- **Customer Reports**: Generate professional reports for client delivery
- **Flexible Periods**: Monthly, quarterly, or yearly reports
- **Multiple Views**: By engineer, by expense type, or trip details
- **Cost Breakdown**: Labor costs vs. expenses analysis
- **Export Capability**: Ready for PDF/Excel export (to be implemented)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Cloud account (for OAuth)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Google Authentication:
   - See `AUTH_SETUP.md` for detailed instructions
   - Create `.env.local` with Google OAuth credentials
   - Configure redirect URIs in Google Cloud Console

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser
5. Sign in with your company Google account

> **Note**: Authentication is required. Without proper setup, you'll be redirected to the login page.

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth.js v5 with Google OAuth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/UI
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📁 Project Structure

```
travelbook/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Dashboard
│   ├── trips/               # Trip management
│   ├── engineers/           # Engineer overview
│   ├── expenses/            # Expense tracking
│   └── reports/             # Customer reports
├── components/              # React components
│   ├── ui/                  # shadcn/UI components
│   ├── nav.tsx             # Navigation bar
│   ├── timeline-view.tsx   # Trip timeline visualization
│   ├── stats-card.tsx      # Dashboard stats cards
│   ├── trip-dialog.tsx     # Add/edit trip modal
│   └── expense-dialog.tsx  # Add/edit expense modal
├── lib/                     # Utilities
│   ├── data.ts             # Sample data & helper functions
│   └── utils.ts            # Utility functions
└── types/                   # TypeScript types
    └── index.ts            # Data models
```

## 🎨 Design Philosophy

The application follows a **Linear-inspired** design approach:
- **Minimalist**: Clean, distraction-free interface
- **Fast**: Optimized for quick navigation and data entry
- **Keyboard-friendly**: Ready for keyboard shortcuts
- **Responsive**: Works seamlessly on desktop and mobile
- **Modern**: Using the latest design patterns

## 🔄 Data Flow

The application uses:
- **Authentication**: NextAuth.js with Google OAuth for secure login
- **State Management**: React Context API for global state
- **Data Storage**: In-memory data (currently in `lib/data.ts`)
- **Team Filtering**: Automatic filtering by email domain

To connect to a real database:

1. Choose your database (PostgreSQL, MongoDB, Supabase, etc.)
2. Replace the data functions in `lib/data.ts` with API calls
3. Add API routes in `app/api/`
4. Store users, trips, and expenses in the database
5. Implement team/organization models

## 📝 Sample Data

The application comes pre-loaded with sample data:
- 4 French engineers
- 6 sample trips to India
- 5 expense records

This makes it easy to explore features immediately.

## 🚧 Future Enhancements

- [ ] Real database integration (PostgreSQL/Supabase)
- [x] User authentication & authorization (Google OAuth)
- [x] Team management by email domain
- [ ] PDF/Excel report export
- [ ] File upload for expense receipts
- [ ] Email notifications for trip reminders
- [ ] Multi-language support (FR/EN)
- [ ] Mobile app (React Native)
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Currency conversion API
- [ ] Advanced analytics & charts

## 🤝 Contributing

This is a custom application for engineering trip management. Feel free to adapt it to your needs.

## 📄 License

Proprietary - For internal use only

## 👥 Contact

For questions or support, contact your engineering team.

---

**Built with ❤️ for efficient engineering project management**
