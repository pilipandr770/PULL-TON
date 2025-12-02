# Local Development Start Script
# Run this from the project root directory

Write-Host "🚀 Starting Community TON Pool Development Environment" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exist in backend
if (-not (Test-Path ".\backend\node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Check if node_modules exist in frontend
if (-not (Test-Path ".\frontend\node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# Create .env file for backend if not exists
if (-not (Test-Path ".\backend\.env")) {
    Write-Host "📝 Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item ".\backend\.env.example" ".\backend\.env"
    Write-Host "⚠️  Please edit backend\.env with your settings" -ForegroundColor Yellow
}

# Initialize database
Write-Host "🗄️  Initializing database..." -ForegroundColor Yellow
Set-Location backend
npx prisma db push
npm run db:seed 2>$null
Set-Location ..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development servers, run these commands in separate terminals:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Terminal 1 (Backend):" -ForegroundColor White
Write-Host "    cd backend; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  Terminal 2 (Frontend):" -ForegroundColor White
Write-Host "    cd frontend; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:3001" -ForegroundColor White
Write-Host "  Admin:     http://localhost:3000/admin" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Default Admin Credentials:" -ForegroundColor Cyan
Write-Host "  Email:    admin@pool.ton" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
