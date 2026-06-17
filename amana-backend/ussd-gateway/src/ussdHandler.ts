/**
 * Amana Protocol - USSD Menu Handler
 * 
 * State machine for the USSD menu flow on GSM feature phones.
 * Maps Africa's Talking USSD callbacks to structured responses.
 * 
 * Menu Flow:
 *   welcome → register_name → register_business → register_pin → main_menu
 *   main_menu → [new_trade | my_trades | balance | profile]
 *   new_trade → new_trade_seller → new_trade_amount → new_trade_currency → new_trade_buyer → new_trade_confirm
 *   my_trades → trade_detail → [confirm_delivery | dispute]
 *   dispute → dispute_reason → dispute_tier → exit
 */

export type USSDResponseType = 'response' | 'release' | 'end';

export interface USSDResponse {
  text: string;
  type: USSDResponseType;
}

export class USSDHandler {
  /**
   * Process an incoming USSD request from Africa's Talking.
   * 
   * @param phoneNumber - MSISDN of the caller (E.164)
   * @param text - The user's input string (Africa's Talking format)
   * @param sessionId - Africa's Talking session ID
   * @returns Formatted USSD response
   */
  handle(phoneNumber: string, text: string, sessionId: string): USSDResponse {
    // Parse the USSD text input
    // Africa's Talking sends: "" (first request), "1*2*3" (subsequent)
    const levels = text ? text.split('*').filter(Boolean) : [];
    const currentLevel = levels.length;

    // Root menu — first interaction
    if (text === '' || text === undefined) {
      return this.showWelcome();
    }

    // Route based on the first menu choice
    const mainOption = levels[0];

    switch (mainOption) {
      case '1':
        return this.handleNewTrade(levels);
      case '2':
        return this.handleMyTrades(levels);
      case '3':
        return this.handleBalance(phoneNumber);
      case '4':
        return this.handleProfile(phoneNumber);
      case '5':
        return this.handleDispute(levels);
      default:
        return this.showError(phoneNumber);
    }
  }

  private showWelcome(): USSDResponse {
    return {
      text: `CON Amana Protocol — Zero-Trust Trade Escrow
================================
Welcome to Amana Trade Escrow.

1. New Trade
2. My Trades
3. Check Balance
4. My Profile
5. File Dispute

Reply with a number or 0 to exit`,
      type: 'response',
    };
  }

  private handleNewTrade(levels: string[]): USSDResponse {
    if (levels.length === 1) {
      return {
        text: `CON New Trade
Enter buyer's phone number:
e.g. +254712345678`,
        type: 'response',
      };
    }
    if (levels.length === 2) {
      return {
        text: `CON Enter trade amount in local currency (KES):
e.g. 50000`,
        type: 'response',
      };
    }
    if (levels.length === 3) {
      return {
        text: `CON Enter trade description:
e.g. 50 bags maize flour`,
        type: 'response',
      };
    }
    if (levels.length === 4) {
      const buyerPhone = levels[1];
      const amount = levels[2];
      const description = levels[3];
      return {
        text: `CON Confirm trade:
Buyer: ${buyerPhone}
Amount: KES ${amount}
Desc: ${description}

1. Confirm
2. Cancel`,
        type: 'response',
      };
    }
    if (levels.length === 5 && levels[4] === '1') {
      return {
        text: `END Trade offer created successfully!
You will be notified when the buyer funds escrow.

Thank you for using Amana.`,
        type: 'release',
      };
    }
    return {
      text: `END Trade cancelled. No charges applied.

Thank you for using Amana.`,
      type: 'release',
    };
  }

  private handleMyTrades(levels: string[]): USSDResponse {
    if (levels.length === 1) {
      return {
        text: `CON My Active Trades
1. Trade #ABC123 — KES 50,000 (In Transit)
2. Trade #DEF456 — KES 12,000 (Awaiting Dispatch)
3. Trade #GHI789 — KES 8,500 (Funded)

Select trade for details or 0 to go back`,
        type: 'response',
      };
    }

    if (levels.length === 2) {
      return {
        text: `CON Trade #ABC123
Status: In Transit
Amount: KES 50,000
Seller: John M.
Buyer: Jane W.
Created: 12 Jun 2025

1. Confirm Delivery
2. File Dispute
3. Back`,
        type: 'response',
      };
    }

    if (levels.length === 3 && levels[2] === '1') {
      return {
        text: `END Delivery confirmed! Funds will be released to seller within 24 hours.

Thank you for using Amana.`,
        type: 'release',
      };
    }

    return {
      text: `END Returning to main menu.`,
      type: 'release',
    };
  }

  private handleBalance(phoneNumber: string): USSDResponse {
    // In production, query the relayer for the merchant's wallet balance
    return {
      text: `END Your Amana Balance
Available: $0.00 USDC
In Escrow: $0.00 USDC

Dial *483# to start a trade.`,
      type: 'release',
    };
  }

  private handleProfile(phoneNumber: string): USSDResponse {
    return {
      text: `END Amana Profile
Phone: ${phoneNumber}
Trades: 0
Volume: KES 0
Status: Active

Thank you for using Amana.`,
      type: 'release',
    };
  }

  private handleDispute(levels: string[]): USSDResponse {
    if (levels.length === 1) {
      return {
        text: `CON File a Dispute
Enter Trade ID:
e.g. ABC123`,
        type: 'response',
      };
    }
    if (levels.length === 2) {
      return {
        text: `CON Select dispute type:
1. Micro Claim (< $50 — auto-resolved)
2. Macro Escalation (admin review)

Choose 1 or 2:`,
        type: 'response',
      };
    }
    if (levels.length === 3) {
      return {
        text: `CON Describe the issue briefly:
e.g. Goods not received after 7 days`,
        type: 'response',
      };
    }
    if (levels.length === 4) {
      const tradeId = levels[1];
      const tier = levels[2] === '1' ? 'Micro' : 'Macro';
      const reason = levels[3];
      return {
        text: `END Dispute filed for Trade #${tradeId}
Tier: ${tier} Claim
Reason: ${reason}

${
  tier === 'Micro'
    ? 'Micro claim is being auto-resolved. You will receive an SMS shortly.'
    : 'Admin will review within 24 hours. You will receive an SMS update.'
}

Thank you for using Amana.`,
        type: 'release',
      };
    }

    return this.showError('');
  }

  private showError(phoneNumber: string): USSDResponse {
    return {
      text: `CON Invalid option. Please try again.

1. New Trade
2. My Trades
3. Check Balance
4. My Profile
5. File Dispute

Reply with a number:`,
      type: 'response',
    };
  }
}

export const ussdHandler = new USSDHandler();