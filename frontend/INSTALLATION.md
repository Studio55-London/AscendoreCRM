# AscendoreCRM Frontend - Installation & First Run

## Prerequisites Check

Before you begin, verify you have:

1. **Node.js 18 or higher**
   ```bash
   node --version
   # Should show: v18.x.x or higher
   ```

2. **npm (comes with Node.js)**
   ```bash
   npm --version
   # Should show: 9.x.x or higher
   ```

3. **Backend API Running**
   - The backend should be running at `http://localhost:3001`
   - Test it: Open http://localhost:3001 in your browser
   - You should see the API response

4. **Database Setup**
   - PostgreSQL database running
   - Migrations completed
   - Dev user created (dev@ascendore.ai / DevPassword123!)

---

## Step 1: Navigate to Frontend Directory

```bash
cd C:\Users\AndrewSmart\Claude_Projects\AscendoreCRM\frontend
```

---

## Step 2: Install Dependencies

```bash
npm install
```

**Expected output:**
```
added 500+ packages in 30s
```

**If you see errors:**
- Try: `npm cache clean --force` then `npm install` again
- Or: Delete `node_modules` and `package-lock.json`, then `npm install`

---

## Step 3: Configure Environment

### Option A: Copy the example file
```bash
copy .env.example .env
```

### Option B: Create manually
Create a file named `.env` in the `frontend` directory with:
```
VITE_API_URL=http://localhost:3001
```

---

## Step 4: Start the Development Server

```bash
npm run dev
```

**Expected output:**
```
VITE v5.0.11  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

---

## Step 5: Open in Browser

1. Open your web browser
2. Go to: **http://localhost:5173**
3. You should see the login page

---

## Step 6: Login

Use the development credentials:

- **Email**: `dev@ascendore.ai`
- **Password**: `DevPassword123!`

Click "Sign In"

---

## Step 7: Verify Everything Works

After logging in, you should see:

1. **Dashboard Page** with:
   - Metrics cards at the top
   - Contacts list on the left
   - Deals pipeline on the right
   - Floating chat button (bottom right)

2. **Sidebar Navigation** (left side) with:
   - Dashboard (active/highlighted)
   - Contacts
   - Companies
   - Deals
   - Activities
   - Chat
   - Settings

3. **Header** (top) with:
   - Search bar
   - Notification bell
   - Your user profile

---

## What to Test

### Test 1: Navigation
- Click "Contacts" in sidebar
- Click "Chat" in sidebar
- Click back to "Dashboard"

### Test 2: Chat Interface
- Click the floating chat button (bottom right)
- Type: "Show me all contacts"
- Press Enter or click Send
- You should get a response

### Test 3: Full-screen Chat
- Click "Chat" in the sidebar
- Type a message
- Try example commands shown

### Test 4: User Menu
- Click your name/avatar in the top right
- Try "Profile Settings"
- Try "Sign Out" (then log back in)

---

## Common Issues & Solutions

### Issue 1: Port 5173 already in use

**Error:**
```
Port 5173 is in use, trying another one...
```

**Solution:**
```bash
# Find what's using the port
netstat -ano | findstr :5173

# Kill that process (replace <PID> with the number from above)
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

---

### Issue 2: Cannot connect to API

**Symptoms:**
- Login fails with "Network Error"
- Console shows CORS errors
- 404 or 500 errors

**Solution:**
1. Verify backend is running: http://localhost:3001
2. Check `.env` file has correct URL
3. Verify CORS is enabled in backend
4. Check backend logs for errors

---

### Issue 3: Module not found errors

**Error:**
```
Cannot find module 'react' or its corresponding type declarations
```

**Solution:**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Issue 4: TypeScript errors

**Error:**
```
TS2307: Cannot find module '@/components/...'
```

**Solution:**
1. Check `tsconfig.json` has path mapping
2. Restart VS Code / your editor
3. Run: `npm run build` to check compilation

---

### Issue 5: Blank white screen

**Symptoms:**
- Page loads but shows nothing
- Console shows errors

**Solution:**
1. Check browser console (F12) for errors
2. Verify backend is running
3. Clear browser cache
4. Try incognito/private mode

---

## Stopping the Server

Press `Ctrl + C` in the terminal where you ran `npm run dev`

---

## Restarting After Stop

Just run:
```bash
npm run dev
```

No need to reinstall dependencies unless `package.json` changed.

---

## File Structure Reference

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── services/       # API integration
│   ├── types/          # TypeScript types
│   └── utils/          # Helper functions
├── public/             # Static assets
├── .env                # Environment config
├── package.json        # Dependencies
└── vite.config.ts      # Vite config
```

---

## Development Workflow

### Normal Day-to-Day

1. Start server: `npm run dev`
2. Edit files in `src/`
3. Save - changes appear instantly (hot reload)
4. Check browser for results
5. Stop server: `Ctrl + C`

### When Adding Dependencies

```bash
# Install new package
npm install package-name

# Install dev dependency
npm install -D package-name
```

### When Ready for Production

```bash
# Build for production
npm run build

# Output will be in: dist/
```

---

## Environment Variables

You can add more variables to `.env`:

```bash
VITE_API_URL=http://localhost:3001
VITE_APP_VERSION=0.1.0
VITE_ENABLE_ANALYTICS=false
```

**Important**: All variables MUST start with `VITE_` to be accessible in the frontend.

---

## Browser Console Tips

### Open Console
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I`
- **Firefox**: Press `F12`
- **Safari**: `Cmd+Option+I`

### What to Look For
- **Red errors**: Something's broken
- **Yellow warnings**: Usually okay, but check them
- **Network tab**: See API calls and responses

---

## Accessing on Other Devices

### On Same Network

```bash
# Start server with --host flag
npm run dev -- --host
```

Then access via:
- Your computer's IP (e.g., http://192.168.1.100:5173)

### Find Your IP

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address"
```

---

## Production Deployment

See deployment guides:
- Vercel: https://vercel.com
- Netlify: https://netlify.com
- AWS Amplify: https://aws.amazon.com/amplify

Build command: `npm run build`
Output directory: `dist`

---

## Keyboard Shortcuts (in dev server terminal)

- `h` - Show help
- `r` - Restart server
- `u` - Show URLs
- `o` - Open in browser
- `c` - Clear console
- `q` - Quit server

---

## VS Code Tips

### Recommended Extensions
1. ESLint
2. Prettier
3. Tailwind CSS IntelliSense
4. TypeScript and JavaScript Language Features

### Format on Save
In VS Code settings:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## Success Indicators

You've successfully installed and started the frontend when:

- [x] `npm install` completed without errors
- [x] `npm run dev` shows "ready in XXXms"
- [x] Browser loads http://localhost:5173
- [x] Login page displays correctly
- [x] You can log in with dev credentials
- [x] Dashboard loads with data
- [x] Navigation works
- [x] Chat interface responds
- [x] No red errors in console

---

## Getting Help

### Check Documentation
1. `README.md` - Full documentation
2. `QUICKSTART.md` - Quick setup guide
3. `DESIGN_GUIDE.md` - UI/design info
4. `PROJECT_SUMMARY.md` - Overview

### Debug Checklist
- [ ] Backend running?
- [ ] `.env` file created?
- [ ] Dependencies installed?
- [ ] Correct Node.js version?
- [ ] Browser console checked?
- [ ] Network tab checked?

---

## What's Next?

After successful installation:

1. **Explore the UI**
   - Navigate through all pages
   - Test the chat interface
   - Try different commands

2. **Read the Documentation**
   - Check `README.md` for features
   - Review `DESIGN_GUIDE.md` for UI patterns
   - See `PROJECT_SUMMARY.md` for overview

3. **Start Customizing**
   - Modify colors in `tailwind.config.js`
   - Add new components in `src/components/`
   - Create new pages in `src/pages/`

4. **Develop Features**
   - Complete the "Coming Soon" pages
   - Add new functionality
   - Integrate with backend

---

## Support

If you encounter issues:

1. Check browser console (F12)
2. Check terminal output
3. Review this installation guide
4. Check `QUICKSTART.md`
5. Review error messages carefully

---

## Summary

**Installation Steps:**
1. ✅ Install Node.js 18+
2. ✅ Navigate to `frontend/` directory
3. ✅ Run `npm install`
4. ✅ Create `.env` file
5. ✅ Run `npm run dev`
6. ✅ Open http://localhost:5173
7. ✅ Login with dev credentials

**Time Required:** ~5-10 minutes

**Difficulty:** Easy

---

Happy coding! 🚀
