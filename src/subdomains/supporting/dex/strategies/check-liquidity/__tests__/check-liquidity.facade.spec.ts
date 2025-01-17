import { mock } from 'jest-mock-extended';
import { BehaviorSubject } from 'rxjs';
import { NodeService } from 'src/integration/blockchain/ain/node/node.service';
import { Blockchain } from 'src/integration/blockchain/shared/enums/blockchain.enum';
import { AssetCategory, AssetType } from 'src/shared/models/asset/asset.entity';
import { createCustomAsset } from 'src/shared/models/asset/__mocks__/asset.entity.mock';
import { DexBscService } from '../../../services/dex-bsc.service';
import { DexDeFiChainService } from '../../../services/dex-defichain.service';
import { DexEthereumService } from '../../../services/dex-ethereum.service';
import { CheckLiquidityStrategies, CheckLiquidityAlias } from '../check-liquidity.facade';
import { BscCoinStrategy } from '../impl/bsc-coin.strategy';
import { DeFiChainDefaultStrategy } from '../impl/defichain-default.strategy';
import { DeFiChainPoolPairStrategy } from '../impl/defichain-poolpair.strategy';
import { EthereumCoinStrategy } from '../impl/ethereum-coin.strategy';
import { BitcoinStrategy } from '../impl/bitcoin.strategy';
import { BscTokenStrategy } from '../impl/bsc-token.strategy';
import { EthereumTokenStrategy } from '../impl/ethereum-token.strategy';
import { DexBitcoinService } from '../../../services/dex-bitcoin.service';
import { AssetService } from 'src/shared/models/asset/asset.service';
import { PurchaseLiquidityStrategies } from '../../purchase-liquidity/purchase-liquidity.facade';
import { OptimismCoinStrategy } from '../impl/optimism-coin.strategy';
import { ArbitrumCoinStrategy } from '../impl/arbitrum-coin.strategy';
import { ArbitrumTokenStrategy } from '../impl/arbitrum-token.strategy';
import { OptimismTokenStrategy } from '../impl/optimism-token.strategy';
import { DexArbitrumService } from '../../../services/dex-arbitrum.service';
import { DexOptimismService } from '../../../services/dex-optimism.service';

describe('CheckLiquidityStrategies', () => {
  let nodeService: NodeService;

  let arbitrumCoin: ArbitrumCoinStrategy;
  let arbitrumToken: ArbitrumTokenStrategy;
  let bitcoin: BitcoinStrategy;
  let bscCoin: BscCoinStrategy;
  let bscToken: BscTokenStrategy;
  let deFiChainPoolPair: DeFiChainPoolPairStrategy;
  let deFiChainDefault: DeFiChainDefaultStrategy;
  let ethereumCoin: EthereumCoinStrategy;
  let ethereumToken: EthereumTokenStrategy;
  let optimismCoin: OptimismCoinStrategy;
  let optimismToken: OptimismTokenStrategy;

  let facade: CheckLiquidityStrategiesWrapper;

  beforeEach(() => {
    nodeService = mock<NodeService>();
    jest.spyOn(nodeService, 'getConnectedNode').mockImplementation(() => new BehaviorSubject(null));

    arbitrumCoin = new ArbitrumCoinStrategy(mock<AssetService>(), mock<DexArbitrumService>());
    arbitrumToken = new ArbitrumTokenStrategy(mock<AssetService>(), mock<DexArbitrumService>());
    bitcoin = new BitcoinStrategy(mock<AssetService>(), mock<DexBitcoinService>());
    bscCoin = new BscCoinStrategy(mock<AssetService>(), mock<DexBscService>());
    bscToken = new BscTokenStrategy(mock<AssetService>(), mock<DexBscService>());
    deFiChainPoolPair = new DeFiChainPoolPairStrategy(mock<AssetService>(), mock<DexDeFiChainService>());
    deFiChainDefault = new DeFiChainDefaultStrategy(
      mock<AssetService>(),
      mock<DexDeFiChainService>(),
      mock<PurchaseLiquidityStrategies>(),
    );
    ethereumCoin = new EthereumCoinStrategy(mock<AssetService>(), mock<DexEthereumService>());
    ethereumToken = new EthereumTokenStrategy(mock<AssetService>(), mock<DexEthereumService>());
    optimismCoin = new OptimismCoinStrategy(mock<AssetService>(), mock<DexOptimismService>());
    optimismToken = new OptimismTokenStrategy(mock<AssetService>(), mock<DexOptimismService>());

    facade = new CheckLiquidityStrategiesWrapper(
      arbitrumCoin,
      arbitrumToken,
      bitcoin,
      bscCoin,
      bscToken,
      deFiChainDefault,
      deFiChainPoolPair,
      ethereumCoin,
      ethereumToken,
      optimismCoin,
      optimismToken,
    );
  });

  describe('#constructor(...)', () => {
    it('adds all checkLiquidityStrategies to a map', () => {
      expect([...facade.getStrategies().entries()].length).toBe(11);
    });

    it('assigns strategies to all aliases', () => {
      expect([...facade.getStrategies().entries()].length).toBe(Object.values(CheckLiquidityAlias).length);
    });

    it('sets all required checkLiquidityStrategies aliases', () => {
      const aliases = [...facade.getStrategies().keys()];

      expect(aliases.includes(CheckLiquidityAlias.ARBITRUM_COIN)).toBe(true);
      expect(aliases.includes(CheckLiquidityAlias.ARBITRUM_TOKEN)).toBe(true);
      expect(aliases.includes(CheckLiquidityAlias.BITCOIN)).toBe(true);
      expect(aliases.includes(CheckLiquidityAlias.BSC_COIN)).toBe(true);
      expect(aliases.includes(CheckLiquidityAlias.BSC_TOKEN)).toBe(true);
      expect(aliases.includes(CheckLiquidityAlias.DEFICHAIN_POOL_PAIR)).toBe(true);
      expect(aliases.includes(CheckLiquidityAlias.DEFICHAIN_DEFAULT)).toBe(true);
      expect(aliases.includes(CheckLiquidityAlias.ETHEREUM_COIN)).toBe(true);
      expect(aliases.includes(CheckLiquidityAlias.ETHEREUM_TOKEN)).toBe(true);
      expect(aliases.includes(CheckLiquidityAlias.OPTIMISM_COIN)).toBe(true);
      expect(aliases.includes(CheckLiquidityAlias.OPTIMISM_TOKEN)).toBe(true);
    });

    it('assigns proper checkLiquidityStrategies to aliases', () => {
      expect(facade.getStrategies().get(CheckLiquidityAlias.ARBITRUM_COIN)).toBeInstanceOf(ArbitrumCoinStrategy);
      expect(facade.getStrategies().get(CheckLiquidityAlias.ARBITRUM_TOKEN)).toBeInstanceOf(ArbitrumTokenStrategy);
      expect(facade.getStrategies().get(CheckLiquidityAlias.BITCOIN)).toBeInstanceOf(BitcoinStrategy);
      expect(facade.getStrategies().get(CheckLiquidityAlias.BSC_COIN)).toBeInstanceOf(BscCoinStrategy);
      expect(facade.getStrategies().get(CheckLiquidityAlias.BSC_TOKEN)).toBeInstanceOf(BscTokenStrategy);
      expect(facade.getStrategies().get(CheckLiquidityAlias.DEFICHAIN_POOL_PAIR)).toBeInstanceOf(
        DeFiChainPoolPairStrategy,
      );
      expect(facade.getStrategies().get(CheckLiquidityAlias.DEFICHAIN_DEFAULT)).toBeInstanceOf(
        DeFiChainDefaultStrategy,
      );
      expect(facade.getStrategies().get(CheckLiquidityAlias.ETHEREUM_COIN)).toBeInstanceOf(EthereumCoinStrategy);
      expect(facade.getStrategies().get(CheckLiquidityAlias.ETHEREUM_TOKEN)).toBeInstanceOf(EthereumTokenStrategy);
      expect(facade.getStrategies().get(CheckLiquidityAlias.OPTIMISM_COIN)).toBeInstanceOf(OptimismCoinStrategy);
      expect(facade.getStrategies().get(CheckLiquidityAlias.OPTIMISM_TOKEN)).toBeInstanceOf(OptimismTokenStrategy);
    });
  });

  describe('#getCheckLiquidityStrategy(...)', () => {
    describe('getting strategy by Asset', () => {
      it('gets ARBITRUM_COIN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(
          createCustomAsset({ blockchain: Blockchain.ARBITRUM, type: AssetType.COIN }),
        );

        expect(strategy).toBeInstanceOf(ArbitrumCoinStrategy);
      });

      it('gets ARBITRUM_TOKEN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(
          createCustomAsset({ blockchain: Blockchain.ARBITRUM, type: AssetType.TOKEN }),
        );

        expect(strategy).toBeInstanceOf(ArbitrumTokenStrategy);
      });

      it('gets BITCOIN strategy for BITCOIN', () => {
        const strategy = facade.getCheckLiquidityStrategy(createCustomAsset({ blockchain: Blockchain.BITCOIN }));

        expect(strategy).toBeInstanceOf(BitcoinStrategy);
      });

      it('gets BSC_COIN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(
          createCustomAsset({ blockchain: Blockchain.BINANCE_SMART_CHAIN, type: AssetType.COIN }),
        );

        expect(strategy).toBeInstanceOf(BscCoinStrategy);
      });

      it('gets BSC_TOKEN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(
          createCustomAsset({ blockchain: Blockchain.BINANCE_SMART_CHAIN, type: AssetType.TOKEN }),
        );

        expect(strategy).toBeInstanceOf(BscTokenStrategy);
      });

      it('gets DEFICHAIN_POOL_PAIR strategy for DEFICHAIN', () => {
        const strategy = facade.getCheckLiquidityStrategy(
          createCustomAsset({ blockchain: Blockchain.DEFICHAIN, category: AssetCategory.POOL_PAIR }),
        );

        expect(strategy).toBeInstanceOf(DeFiChainPoolPairStrategy);
      });

      it('gets DEFICHAIN_DEFAULT strategy for DEFICHAIN', () => {
        const strategyCrypto = facade.getCheckLiquidityStrategy(
          createCustomAsset({ blockchain: Blockchain.DEFICHAIN, category: AssetCategory.CRYPTO }),
        );

        expect(strategyCrypto).toBeInstanceOf(DeFiChainDefaultStrategy);

        const strategyStock = facade.getCheckLiquidityStrategy(
          createCustomAsset({ blockchain: Blockchain.DEFICHAIN, category: AssetCategory.STOCK }),
        );

        expect(strategyStock).toBeInstanceOf(DeFiChainDefaultStrategy);
      });

      it('gets ETHEREUM_COIN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(
          createCustomAsset({ blockchain: Blockchain.ETHEREUM, type: AssetType.COIN }),
        );

        expect(strategy).toBeInstanceOf(EthereumCoinStrategy);
      });

      it('gets ETHEREUM_TOKEN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(
          createCustomAsset({ blockchain: Blockchain.ETHEREUM, type: AssetType.TOKEN }),
        );

        expect(strategy).toBeInstanceOf(EthereumTokenStrategy);
      });

      it('gets OPTIMISM_COIN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(
          createCustomAsset({ blockchain: Blockchain.OPTIMISM, type: AssetType.COIN }),
        );

        expect(strategy).toBeInstanceOf(OptimismCoinStrategy);
      });

      it('gets OPTIMISM_TOKEN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(
          createCustomAsset({ blockchain: Blockchain.OPTIMISM, type: AssetType.TOKEN }),
        );

        expect(strategy).toBeInstanceOf(OptimismTokenStrategy);
      });

      it('fails to get strategy for non-supported Blockchain', () => {
        const testCall = () =>
          facade.getCheckLiquidityStrategy(createCustomAsset({ blockchain: 'NewBlockchain' as Blockchain }));

        expect(testCall).toThrow();
        expect(testCall).toThrowError('No CheckLiquidityStrategy found. Alias: undefined');
      });
    });

    describe('getting strategy by CheckLiquidityAlias', () => {
      it('gets ARBITRUM_COIN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(CheckLiquidityAlias.ARBITRUM_COIN);

        expect(strategy).toBeInstanceOf(ArbitrumCoinStrategy);
      });

      it('gets ARBITRUM_TOKEN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(CheckLiquidityAlias.ARBITRUM_TOKEN);

        expect(strategy).toBeInstanceOf(ArbitrumTokenStrategy);
      });

      it('gets BITCOIN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(CheckLiquidityAlias.BITCOIN);

        expect(strategy).toBeInstanceOf(BitcoinStrategy);
      });

      it('gets BSC_COIN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(CheckLiquidityAlias.BSC_COIN);

        expect(strategy).toBeInstanceOf(BscCoinStrategy);
      });

      it('gets BSC_TOKEN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(CheckLiquidityAlias.BSC_TOKEN);

        expect(strategy).toBeInstanceOf(BscTokenStrategy);
      });

      it('gets DEFICHAIN_POOL_PAIR strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(CheckLiquidityAlias.DEFICHAIN_POOL_PAIR);

        expect(strategy).toBeInstanceOf(DeFiChainPoolPairStrategy);
      });

      it('gets DEFICHAIN_DEFAULT strategy', () => {
        const strategyCrypto = facade.getCheckLiquidityStrategy(CheckLiquidityAlias.DEFICHAIN_DEFAULT);

        expect(strategyCrypto).toBeInstanceOf(DeFiChainDefaultStrategy);
      });

      it('gets ETHEREUM_COIN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(CheckLiquidityAlias.ETHEREUM_COIN);

        expect(strategy).toBeInstanceOf(EthereumCoinStrategy);
      });

      it('gets ETHEREUM_TOKEN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(CheckLiquidityAlias.ETHEREUM_TOKEN);

        expect(strategy).toBeInstanceOf(EthereumTokenStrategy);
      });

      it('gets OPTIMISM_COIN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(CheckLiquidityAlias.OPTIMISM_COIN);

        expect(strategy).toBeInstanceOf(OptimismCoinStrategy);
      });

      it('gets OPTIMISM_TOKEN strategy', () => {
        const strategy = facade.getCheckLiquidityStrategy(CheckLiquidityAlias.OPTIMISM_TOKEN);

        expect(strategy).toBeInstanceOf(OptimismTokenStrategy);
      });

      it('fails to get strategy for non-supported CheckLiquidityAlias', () => {
        const testCall = () =>
          facade.getCheckLiquidityStrategy('NonExistingCheckLiquidityAlias' as CheckLiquidityAlias);

        expect(testCall).toThrow();
        expect(testCall).toThrowError('No CheckLiquidityStrategy found. Alias: NonExistingCheckLiquidityAlias');
      });
    });
  });
});

class CheckLiquidityStrategiesWrapper extends CheckLiquidityStrategies {
  constructor(
    arbitrumCoin: ArbitrumCoinStrategy,
    arbitrumToken: ArbitrumTokenStrategy,
    bitcoin: BitcoinStrategy,
    bscCoin: BscCoinStrategy,
    bscToken: BscTokenStrategy,
    deFiChainDefault: DeFiChainDefaultStrategy,
    deFiChainPoolPair: DeFiChainPoolPairStrategy,
    ethereumCoin: EthereumCoinStrategy,
    ethereumToken: EthereumTokenStrategy,
    optimismCoin: OptimismCoinStrategy,
    optimismToken: OptimismTokenStrategy,
  ) {
    super(
      arbitrumCoin,
      arbitrumToken,
      bitcoin,
      bscCoin,
      bscToken,
      deFiChainDefault,
      deFiChainPoolPair,
      ethereumCoin,
      ethereumToken,
      optimismCoin,
      optimismToken,
    );
  }

  getStrategies() {
    return this.strategies;
  }
}
