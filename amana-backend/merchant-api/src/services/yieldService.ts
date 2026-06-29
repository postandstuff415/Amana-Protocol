import { tradeRepo } from '../repositories/tradeRepository';
import { ethers } from 'ethers';
import { ApiResponse } from '../shared-types';

// Contract addresses from DEPLOYMENT.md
const ESCROW_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
const SPLITTER_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

// RPC URL - Default to Base Sepolia
const RPC_URL = process.env.RPC_URL || 'https://sepolia.base.org';

const ESCROW_ABI = [
  'function liquidityBufferFloor() public view returns (uint256)',
  'function totalYieldAllocated() public view returns (uint256)',
  'function tradeCount() public view returns (uint256)',
];

const SPLITTER_ABI = [
  'function frontEndPool() public view returns (address)',
  'function middleEndPool() public view returns (address)',
  'function backEndPool() public view returns (address)',
];

const ERC20_ABI = [
  'function balanceOf(address) public view returns (uint256)',
];


export interface YieldData {
  totalYieldGenerated: string;
  merchantRebateShare: string;
  liquidityFloor: string;
  liquidEscrow: string;
  yieldBearingEscrow: string;
  lastUpdated: string;
}

class YieldService {
  private provider: ethers.JsonRpcProvider;
  private escrowContract: ethers.Contract;
  private splitterContract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, this.provider);
    this.splitterContract = new ethers.Contract(SPLITTER_ADDRESS, SPLITTER_ABI, this.provider);
  }

  async getYieldStats(): Promise<ApiResponse<YieldData>> {
    try {
      // Fetch data from AmanaEscrow
      const [liquidityFloor, yieldBearingEscrow] = await Promise.all([
        this.escrowContract.liquidityBufferFloor().catch(() => 0n),
        this.escrowContract.totalYieldAllocated().catch(() => 0n),
      ]);

      // Fetch liquid balance in AmanaEscrow (ETH for simulation, stablecoin in prod)
      const liquidEscrow = await this.provider.getBalance(ESCROW_ADDRESS).catch(() => 0n);

      // totalYieldGenerated calculation:
      // In this protocol, it's 1% trade fee + yield from vaults.
      const totalVolume = tradeRepo.totalVolume();
      const tradeFees = totalVolume * 0.01;
      
      // Assume a conservative 4.5% APY on yield-bearing escrow, 
      // simulated for the duration of the pilot.
      const simulatedYieldFromVaults = Number(ethers.formatUnits(yieldBearingEscrow, 6)) * 0.045 / 12; // 1 month yield
      
      const totalYieldGenerated = (tradeFees + simulatedYieldFromVaults).toFixed(2);
      const merchantRebateShare = (Number(totalYieldGenerated) * 0.35).toFixed(2); // 35% to front-end rebates

      return {
        success: true,
        data: {
          totalYieldGenerated,
          merchantRebateShare,
          liquidityFloor: ethers.formatUnits(liquidityFloor, 6),
          liquidEscrow: ethers.formatUnits(liquidEscrow, 18),
          yieldBearingEscrow: ethers.formatUnits(yieldBearingEscrow, 6),
          lastUpdated: new Date().toISOString(),
        }
      };
    } catch (error) {
      console.error('[YieldService] Error fetching yield stats:', error);
      return {
        success: false,
        error: 'Failed to fetch yield statistics from blockchain'
      };
    }
  }
}

export const yieldService = new YieldService();
