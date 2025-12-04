# Movement Counter dApp 🎮

A full-stack decentralized counter application built on **Movement Network** with **Shinami gas sponsorship** for gasless transactions. Users can increment or decrement their counter using either **Privy embedded wallets** or **native Aptos wallets** (like Nightly) - all without paying gas fees!

## ✨ Features

- 🎯 **Dual Wallet Support**: Connect with Privy (social login) or native Aptos wallets
- ⛽ **Gas-Free Transactions**: All transactions sponsored by Shinami Gas Station
- 🚀 **Level System**: Earn levels every 100 counter points
- 🔥 **Streak Tracking**: Build momentum with consecutive actions
- 📊 **Real-time Updates**: Live counter synchronization with blockchain
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- ⚡ **Debounced Transactions**: Batch multiple actions for efficiency

## 🏗️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Blockchain**: Movement Network (Aptos-based)
- **Wallet Integration**: 
  - Privy (embedded wallets with social login)
  - Aptos Wallet Adapter (native wallets)
- **Gas Sponsorship**: Shinami Gas Station
- **Smart Contract**: Move language on Movement Network

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm/yarn/pnpm
- **Privy Account**: [Sign up at Privy](https://privy.io/)
- **Shinami API Key**: [Get your key from Shinami](https://www.shinami.com/)
- **Movement Network**: Deployed smart contract (or use the existing one)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/dumbdevss/movement-counter.git
cd movement-counter
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Shinami Gas Station API Key
SHINAMI_GAS_STATION_KEY=your_shinami_gas_station_key_here
```

**How to get these values:**

#### Privy App ID
1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Create a new app or select existing one
3. Copy your App ID from Settings
4. Enable login methods: Email, Google, Twitter, Discord, GitHub

#### Shinami Gas Station Key
1. Sign up at [Shinami](https://www.shinami.com/)
2. Navigate to Gas Station section
3. Create a new API key for Movement Network
4. Copy the key (format: `us1_movement_testnet_xxx`)

### 4. Configure Smart Contract

Update the contract address in `app/lib/aptos.ts`:

```typescript
export const CONTRACT_ADDRESS = 'your_deployed_contract_address';
```

**Current deployed contract**: `0x88d5bf2a5368c3cf3283e952e70e510cb8ce6318cfd587f1164e549827c87596`

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app! 🎉

## 🏗️ Project Structure

```
movement-counter/
├── app/
│   ├── api/
│   │   └── sponsor-transaction/    # Backend API for Shinami gas sponsorship
│   │       └── route.ts
│   ├── components/
│   │   ├── CounterArena.tsx        # Main game interface
│   │   ├── counterItem.tsx         # Counter logic and UI
│   │   ├── LoginPage.tsx           # Wallet connection page
│   │   ├── WalletDropdown.tsx      # Wallet info display
│   │   ├── wallet-selection-modal.tsx  # Wallet connection modal
│   │   └── ui/                     # Reusable UI components
│   ├── lib/
│   │   ├── aptos.ts               # Aptos SDK configuration
│   │   ├── transactions.ts        # Transaction building and signing
│   │   ├── shinami.ts             # Shinami client setup
│   │   └── privy-movement.ts      # Privy wallet utilities
│   ├── providers.tsx              # App-wide providers
│   ├── page.tsx                   # Main page component
│   └── layout.tsx                 # Root layout
├── public/                        # Static assets
└── package.json
```

## 🔑 Key Components

### Transaction Flow

#### Privy Wallet
1. Build feePayer transaction
2. Sign with Privy's `signRawHash`
3. Send to backend API
4. Backend sponsors via Shinami
5. Wait for confirmation

#### Native Wallet
1. Build feePayer transaction (5-min expiration)
2. Sign with wallet's `signTransaction`
3. Send to backend API
4. Backend sponsors via Shinami
5. Wait for confirmation

### Gas Sponsorship

All transactions are sponsored by Shinami Gas Station:

```typescript
// Backend API route: /api/sponsor-transaction
POST /api/sponsor-transaction
{
  "serializedTransaction": "0x...",
  "senderSignature": "0x..."
}
```

The backend calls Shinami's `gas_sponsorAndSubmitSignedTransaction` API to sponsor and submit the transaction.

## 🎮 How to Use

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Choose Privy (social login) or Native Wallet (Nightly, etc.)

2. **Play the Game**
   - Click **INCREMENT** to increase counter
   - Click **DECREMENT** to decrease counter
   - Actions are batched and synced after 2 seconds
   - Or click **SYNC NOW** to submit immediately

3. **Track Progress**
   - Level up every 100 points
   - Build streaks with consecutive actions
   - View wallet info in dropdown

## 🌐 Network Configuration

Switch between Movement Mainnet and Testnet in `app/lib/aptos.ts`:

```typescript
export const CURRENT_NETWORK = 'testnet' as keyof typeof MOVEMENT_CONFIGS;
// Change to 'mainnet' for production
```

**Network Details:**
- **Testnet**: Chain ID 250, RPC: `https://testnet.movementnetwork.xyz/v1`
- **Mainnet**: Chain ID 126, RPC: `https://full.mainnet.movementinfra.xyz/v1`

## 🔧 Smart Contract

The counter smart contract is written in Move:

```move
module counter::counter {
    public entry fun add_counter(account: &signer, amount: u64);
    public entry fun subtract_counter(account: &signer, amount: u64);
    public fun get_counter(addr: address): u64;
}
```

**Functions:**
- `add_counter`: Increment counter by amount
- `subtract_counter`: Decrement counter by amount
- `get_counter`: View current counter value

## 📦 Build for Production

```bash
npm run build
npm run start
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_PRIVY_APP_ID`
- `SHINAMI_GAS_STATION_KEY`

## 🐛 Troubleshooting

### Transaction Fails
- Check Shinami API key is valid
- Ensure contract address is correct
- Verify wallet has been initialized on Movement Network

### Wallet Connection Issues
- Clear browser cache and cookies
- Try a different wallet
- Check Privy app configuration

### Gas Sponsorship Not Working
- Verify Shinami key has Movement Network access
- Check API key format: `us1_movement_testnet_xxx`
- Review backend logs in `/api/sponsor-transaction`

## 📚 Resources

- [Movement Network Docs](https://docs.movementnetwork.xyz/)
- [Shinami Documentation](https://docs.shinami.com/)
- [Privy Documentation](https://docs.privy.io/)
- [Aptos SDK](https://aptos.dev/sdks/ts-sdk/)


Built with ❤️ on Movement Network
