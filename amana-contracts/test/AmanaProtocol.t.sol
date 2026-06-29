// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AmanaEscrow.sol";
import "../src/AmanaRevenueSplitter.sol";
import "../src/AmanaTrustScore.sol";
import "../src/AmanaDisputeEngine.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {
        _mint(msg.sender, 1000000 * 1e6);
    }
}

contract AmanaProtocolTest is Test {
    AmanaEscrow public escrow;
    AmanaRevenueSplitter public splitter;
    AmanaTrustScore public trustScore;
    AmanaDisputeEngine public disputeEngine;
    MockToken public token;

    address public owner = address(1);
    address public buyer = address(2);
    address public seller = address(3);
    address public middleEnd = address(4);
    address public backEnd = address(5);
    address public frontEnd = address(6);
    address public chairman = address(7);

    function setUp() public {
        vm.startPrank(owner);
        
        token = new MockToken();
        trustScore = new AmanaTrustScore();
        splitter = new AmanaRevenueSplitter(frontEnd, middleEnd, backEnd);
        escrow = new AmanaEscrow(address(splitter), address(trustScore));
        disputeEngine = new AmanaDisputeEngine(address(escrow), frontEnd, chairman);
        
        escrow.setDisputeEngine(address(disputeEngine));
        
        // Increase ceiling for tests
        trustScore.setCeilingParams(1000 * 1e6, 10000 * 1e6, 50 * 1e6);
        
        token.transfer(buyer, 1000 * 1e6);

        vm.stopPrank();

        // Warp time to avoid cooldown issues
        vm.warp(100 days);
    }

    function testCreateTrade() public {
        vm.startPrank(buyer);
        token.approve(address(escrow), 100 * 1e6);
        uint256 tradeId = escrow.initializeTrade(seller, address(token), 100 * 1e6);
        vm.stopPrank();

        (address b, address s, address t, uint256 a, uint256 f, AmanaEscrow.State st, , ) = escrow.trades(tradeId);
        assertEq(b, buyer);
        assertEq(s, seller);
        assertEq(a, 99 * 1e6); // 1% fee
        assertEq(f, 1 * 1e6);
        assertEq(uint(st), uint(AmanaEscrow.State.CREATED));
    }

    function testCompleteTrade() public {
        vm.startPrank(buyer);
        token.approve(address(escrow), 100 * 1e6);
        uint256 tradeId = escrow.initializeTrade(seller, address(token), 100 * 1e6);
        vm.stopPrank();

        vm.prank(seller);
        escrow.markAsShipped(tradeId);

        vm.prank(buyer);
        escrow.releaseEscrow(tradeId);

        assertEq(token.balanceOf(seller), 99 * 1e6);
        assertEq(token.balanceOf(address(splitter)), 1 * 1e6);
        
        // Check trust score increase
        (, uint256 tradeCount, ) = trustScore.scores(buyer);
        assertEq(tradeCount, 1);
    }

    function testMicroShieldDispute() public {
        vm.startPrank(buyer);
        token.approve(address(escrow), 50 * 1e6); // Below $100
        uint256 tradeId = escrow.initializeTrade(seller, address(token), 50 * 1e6);
        escrow.raiseDispute(tradeId);
        vm.stopPrank();

        disputeEngine.processDispute(tradeId);

        ( , , , , , AmanaEscrow.State st, , ) = escrow.trades(tradeId);
        assertEq(uint(st), uint(AmanaEscrow.State.REFUNDED));
        assertEq(token.balanceOf(buyer), 1000 * 1e6); // Refunded full amount including fee
    }

    function testMacroDispute() public {
        vm.startPrank(buyer);
        token.approve(address(escrow), 200 * 1e6); // Above $100
        uint256 tradeId = escrow.initializeTrade(seller, address(token), 200 * 1e6);
        escrow.raiseDispute(tradeId);
        vm.stopPrank();

        disputeEngine.processDispute(tradeId);

        ( , , , , , AmanaEscrow.State st, , ) = escrow.trades(tradeId);
        assertEq(uint(st), uint(AmanaEscrow.State.DISPUTED)); // Still disputed, needs chairman

        vm.prank(chairman);
        disputeEngine.resolveMacroDispute(tradeId, AmanaEscrow.State.COMPLETED);

        ( , , , , , st, , ) = escrow.trades(tradeId);
        assertEq(uint(st), uint(AmanaEscrow.State.COMPLETED));
        assertEq(token.balanceOf(seller), 198 * 1e6);
    }
}
