'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { polygon, polygonAmoy, localhost, hardhat } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'

// Local development chain configuration
const localChain = {
  id: 1337,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
}

// Only include WalletConnect if we have a project ID
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// Determine which network to use based on environment variable
const isProduction = process.env.NEXT_PUBLIC_NETWORK === 'polygon'
const defaultChains = isProduction ? [polygon, polygonAmoy] : [localChain, polygon, polygonAmoy]

const configOptions: any = {
  chains: defaultChains,
  transports: {
    [localChain.id]: http('http://127.0.0.1:8545'),
    [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID || 'demo'}`),
    [polygonAmoy.id]: http(`https://polygon-amoy.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID || 'demo'}`),
  },
  appName: 'TipNest Staking',
  appDescription: 'Stake TIP tokens and earn rewards',
  appUrl: 'https://tipnest.io',
  appIcon: 'https://tipnest.io/logo.png',
}

// Only add WalletConnect if we have a valid project ID
if (walletConnectProjectId && walletConnectProjectId !== 'test-project-id') {
  configOptions.walletConnectProjectId = walletConnectProjectId
}

const config = createConfig(getDefaultConfig(configOptions))

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="auto" mode="dark">
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}