export enum Blockchain {
  DEFICHAIN = 'DeFiChain',
  BITCOIN = 'Bitcoin',
  ETHEREUM = 'Ethereum',
  BINANCE_SMART_CHAIN = 'BinanceSmartChain',
  OPTIMISM = 'Optimism',
  ARBITRUM = 'Arbitrum',
  POLYGON = 'Polygon',
}

export const BlockchainExplorerUrls: { [b in Blockchain]: string } = {
  [Blockchain.DEFICHAIN]: 'https://defiscan.live/transactions',
  [Blockchain.BITCOIN]: 'https://blockstream.info/tx',
  [Blockchain.ETHEREUM]: 'https://etherscan.io/tx',
  [Blockchain.BINANCE_SMART_CHAIN]: 'https://bscscan.com/tx',
  [Blockchain.OPTIMISM]: 'https://optimistic.etherscan.io/tx',
  [Blockchain.ARBITRUM]: 'https://arbiscan.io/tx',
  [Blockchain.POLYGON]: 'https://polygonscan.com/tx',
};
