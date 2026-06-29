// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {AmanaTrustScore} from "../src/AmanaTrustScore.sol";
import {AmanaRevenueSplitter} from "../src/AmanaRevenueSplitter.sol";
import {AmanaEscrow} from "../src/AmanaEscrow.sol";
import {AmanaDisputeEngine} from "../src/AmanaDisputeEngine.sol";

/**
 * @title DeployAll
 * @dev Foundry deployment script for the Amana Protocol core contracts.
 * 
 * Deployment order:
 * 1. AmanaTrustScore
 * 2. AmanaRevenueSplitter (requires pool addresses)
 * 3. AmanaEscrow (requires TrustScore + RevenueSplitter)
 * 4. AmanaDisputeEngine (requires Escrow + pool + ambassador)
 * 5. Link Escrow → DisputeEngine
 * 
 * Usage:
 *   source .env
 *   forge script script/DeployAll.s.sol --rpc-url $RPC_URL --broadcast --verify
 */
contract DeployAll is Script {
    // Pool addresses — set via environment variables or replace with actual addresses
    address constant FRONT_END_POOL = 0x0000000000000000000000000000000000000001;
    address constant MIDDLE_END_POOL = 0x0000000000000000000000000000000000000002;
    address constant BACK_END_POOL = 0x0000000000000000000000000000000000000003;
    address constant AMBASSADOR_CHAIRMAN = 0x0000000000000000000000000000000000000004;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy AmanaTrustScore
        AmanaTrustScore trustScore = new AmanaTrustScore();
        console.log("AmanaTrustScore deployed at:", address(trustScore));

        // 2. Deploy AmanaRevenueSplitter
        AmanaRevenueSplitter revenueSplitter = new AmanaRevenueSplitter(
            FRONT_END_POOL,
            MIDDLE_END_POOL,
            BACK_END_POOL
        );
        console.log("AmanaRevenueSplitter deployed at:", address(revenueSplitter));

        // 3. Deploy AmanaEscrow
        AmanaEscrow escrow = new AmanaEscrow(
            address(revenueSplitter),
            address(trustScore)
        );
        console.log("AmanaEscrow deployed at:", address(escrow));

        // 4. Deploy AmanaDisputeEngine
        AmanaDisputeEngine disputeEngine = new AmanaDisputeEngine(
            address(escrow),
            FRONT_END_POOL,
            AMBASSADOR_CHAIRMAN
        );
        console.log("AmanaDisputeEngine deployed at:", address(disputeEngine));

        // 5. Link: set DisputeEngine address on Escrow
        escrow.setDisputeEngine(address(disputeEngine));
        console.log("Linked: Escrow.setDisputeEngine(", address(disputeEngine), ")");

        // 6. Set TrustScore params (optional — tune ceiling values)
        trustScore.setCeilingParams(
            100 * 1e6,   // baseCeiling: $100
            10000 * 1e6, // maxCeiling: $10,000
            50 * 1e6     // incrementPerTrade: $50
        );

        vm.stopBroadcast();

        // Log deployment summary
        console.log("--- Amana Protocol Deployment Complete ---");
        console.log("Network: Base Sepolia (chainId 84532)");
        console.log("Deployer:", deployer);
        console.log("TrustScore:", address(trustScore));
        console.log("RevenueSplitter:", address(revenueSplitter));
        console.log("Escrow:", address(escrow));
        console.log("DisputeEngine:", address(disputeEngine));
    }
}