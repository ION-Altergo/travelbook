# Quick Start Guide

## 🚀 Get Up and Running in 2 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

That's it! The app comes with sample data so you can explore all features immediately.

## 📱 What You Can Do Right Now

### Dashboard (/)
- View the visual timeline of all engineers' trips
- See key metrics at a glance
- Browse upcoming trips

### Trips (/trips)
- View all trips in a card layout
- Filter by engineer, status, or search
- Click "Add Trip" to create new trips
- See estimated costs for each trip

### Engineers (/engineers)
- View all team members
- See statistics per engineer (days on-site, trips, revenue)
- Check availability status

### Expenses (/expenses)
- Track all expenses in a table view
- Filter by type, engineer, or search
- Click "Add Expense" to record new expenses
- See real-time totals

### Reports (/reports)
- Generate reports by month, quarter, or year
- Filter by engineer
- View breakdowns by engineer, expense type, or trip
- Export reports for customer delivery (to be implemented)

## 🎨 Customization

### Adding Real Engineers
Edit `lib/data.ts` and update the `engineers` array:

```typescript
export const engineers: Engineer[] = [
  {
    id: '1',
    name: 'Your Engineer Name',
    email: 'email@company.fr',
    role: 'Engineer Title',
    dailyRate: 800,
    color: '#3b82f6', // Any hex color
  },
  // Add more engineers...
];
```

### Changing Colors
The app uses Tailwind CSS. Colors can be customized in:
- `app/globals.css` - Theme colors
- Individual components - Inline styles and Tailwind classes

### Adding a Logo
Replace the Plane icon in `components/nav.tsx` with your company logo.

## 🔄 Next Steps

1. **Connect a Database**: Replace in-memory data with PostgreSQL, MongoDB, or Supabase
2. **Add Authentication**: Implement user login with NextAuth.js
3. **Deploy**: Deploy to Vercel, Netlify, or your preferred hosting

## 💡 Tips

- **Keyboard Navigation**: Use Tab to navigate, Enter to open dialogs
- **Mobile Friendly**: The app is responsive and works on all devices
- **Fast**: Built with Next.js 15 and Turbopack for instant updates

## 📚 Learn More

- See `README.md` for complete documentation
- Check `types/index.ts` for data models
- Explore `lib/data.ts` for helper functions

## 🆘 Common Issues

**Port already in use?**
```bash
# Kill the process on port 3000
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

**Dependencies not installing?**
```bash
# Clear npm cache
npm cache clean --force
# Reinstall
rm -rf node_modules package-lock.json
npm install
```

---

**Happy trip planning! ✈️**

