# 🌊 CommunityTonPool - Zero-Fee TON Staking Pool

A decentralized TON staking pool with **zero commissions** - neither from deposits, nor from profits.

## 🎯 Features

- ✅ **Zero fees** - no commissions for the author, all rewards belong to participants
- ✅ **Minimum entry**: 1 TON
- ✅ **Immutable** - no owner functions, code cannot be changed after deployment
- ✅ **Transparent** - all balances and shares are publicly readable on-chain
- ✅ **Fair distribution** - rewards are distributed proportionally to shares

## 📋 How It Works

### Shares System
- When you deposit TON, you receive **shares** proportional to your contribution
- First depositor: 1 share = 1 nanoTON
- Later depositors: `newShares = amount * totalShares / poolBalance`

### Rewards Distribution
- Any TON sent to the contract (without "deposit" comment) increases the pool balance
- Since shares don't change, the **value of each share increases**
- This is how staking rewards are distributed fairly

### Withdrawal
- You can withdraw your shares at any time
- Payout = `liquidBalance * yourShares / totalShares`
- A small reserve (0.05 TON) is kept for storage rent

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- TON wallet with some TON for deployment

### Installation

```powershell
# Clone the repository
git clone <your-repo>
cd pull_ton

# Install dependencies
npm install
```

### Configuration

1. Copy the example environment file:
```powershell
Copy-Item .env.example .env
```

2. Edit `.env` and add your wallet mnemonic:
```
MNEMONIC=word1 word2 word3 ... word24
```

⚠️ **NEVER share your mnemonic or commit it to git!**

### Build

```powershell
npm run build
```

### Deploy

**Testnet** (get test TON from https://t.me/testgiver_ton_bot):
```powershell
npm run deploy:testnet
```

**Mainnet** (use with caution!):
```powershell
npm run deploy:mainnet
```

### Interact

```powershell
# View pool info
npm run info

# Deposit 5 TON
npm run deposit 5

# Withdraw shares
npm run withdraw 1000000000000

# Check your balance
npm run balance
```

## 📁 Project Structure

```
pull_ton/
├── contracts/
│   └── CommunityTonPool.tact    # Main smart contract
├── build/
│   ├── *.boc                    # Compiled contract code
│   └── *.ts                     # TypeScript wrappers
├── scripts/
│   ├── deploy.ts                # Deployment script
│   └── interact.ts              # Interaction script
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security

### Contract Safety Features

1. **No owner** - nobody can withdraw funds without shares
2. **No upgrade mechanism** - code is immutable after deployment
3. **No special functions** - all users are equal
4. **Storage reserve** - contract always keeps 0.05 TON for rent

### What This Contract Does NOT Do

- ❌ Does NOT connect to validators directly
- ❌ Does NOT manage nominator pools
- ❌ Does NOT have an owner who can steal funds

### Integration with Staking

This is a **cooperative savings pool**. To actually stake TON:

1. Collect enough TON in the pool (typically 10,000+ TON for validation)
2. Manually delegate to a nominator pool or liquid staking protocol
3. Rewards received are automatically distributed when sent to the contract

## 💰 Business Model: Personal Cabinet (5€/month)

The contract has **zero on-chain fees**. Monetization is done off-chain:

- **Free**: Direct on-chain interaction (deposit, withdraw, check balances)
- **Paid (5€/month)**: Web dashboard with:
  - Beautiful UI for deposits/withdrawals
  - Real-time analytics
  - Staking rewards tracking
  - Email/Telegram notifications
  - Historical charts

This way, money in the pool is controlled **only** by the smart contract, while you monetize the convenience layer.

## 📜 Contract API

### Messages

| Message | Description |
|---------|-------------|
| `"deposit"` | Deposit TON and receive shares |
| `Withdraw{ shares }` | Withdraw specified number of shares |
| Any other | Treated as donation (reward distribution) |

### Getters

| Getter | Returns |
|--------|---------|
| `poolBalance()` | Total TON balance in nanoTON |
| `totalPoolShares()` | Total shares in the pool |
| `userShares(address)` | Shares of a specific user |
| `sharePrice()` | Current price of one share in nanoTON |

### Error Codes

| Code | Description |
|------|-------------|
| 1001 | Deposit below minimum (1 TON) |
| 1002 | Zero shares (should not happen) |
| 1003 | Trying to withdraw more shares than owned |
| 1004 | No liquidity for withdrawal |
| 1005 | Payout is zero |

## ⚠️ Disclaimer

**This contract is a prototype!** Before using with real funds:

1. Get a professional security audit (CertiK, Hacken, etc.)
2. Test thoroughly on testnet
3. Start with small amounts on mainnet

The author is not responsible for any loss of funds.

## 📄 License

MIT License - feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📞 Contact

For questions or collaboration:
- Telegram: @your_handle
- Email: your@email.com
