import sqlite3
import time
import json
import urllib.request
import os
import sys

DB_PATH = "/home/team/shared/amana-backend/data/amana.db"
RELAYER_URL = os.environ.get("RELAYER_URL", "http://localhost:3003")

def get_recent_trades():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return []
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        # Get trades from last 7 days
        cursor.execute("SELECT amount, created_at FROM trades WHERE created_at > datetime('now', '-7 days')")
        trades = cursor.fetchall()
        conn.close()
        return trades
    except Exception as e:
        print(f"Error reading database: {e}")
        return []

def predict_liquidity_floor(trades):
    # Simple EMA prediction for next 72 hours
    # Logic: volume per hour * 72 * safety factor
    if not trades:
        print("No recent trades found, using default floor.")
        return 10**18 # 1 unit (e.g. 1 USDC in wei if 18 decimals, though USDC is 6)
    
    # Calculate hourly volume
    # Database uses TEXT for amount (wei string)
    try:
        total_volume = sum(int(t[0]) for t in trades)
    except ValueError:
        total_volume = sum(float(t[0]) for t in trades)
        
    avg_hourly_volume = total_volume / (7 * 24)
    
    predicted_volume_72h = avg_hourly_volume * 72
    safety_variance = 1.15
    floor = predicted_volume_72h * safety_variance
    return int(floor)

def update_on_chain(floor):
    print(f"Updating liquidity floor to {floor} on-chain...", flush=True)
    data = json.dumps({
        "phoneNumber": "+protocol", # System call
        "action": "update_liquidity_floor",
        "amount": str(floor)
    }).encode('utf-8')
    
    req = urllib.request.Request(f"{RELAYER_URL}/api/relayer/sponsor", data=data, 
                                 headers={'Content-Type': 'application/json'})
    try:
        print(f"Sending request to {RELAYER_URL}/api/relayer/sponsor...", flush=True)
        with urllib.request.urlopen(req, timeout=10) as f:
            resp = f.read().decode('utf-8')
            print(f"Relayer response: {resp}", flush=True)
    except Exception as e:
        print(f"Error updating on-chain: {e}", flush=True)

def main():
    print("Amana Predictive Liquidity Microservice started.", flush=True)
    print(f"Database: {DB_PATH}", flush=True)
    print(f"Relayer: {RELAYER_URL}", flush=True)
    
    while True:
        try:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Calculating liquidity floor...", flush=True)
            trades = get_recent_trades()
            floor = predict_liquidity_floor(trades)
            print(f"Calculated Φ(t): {floor}", flush=True)
            update_on_chain(floor)
        except Exception as e:
            print(f"Main loop error: {e}", flush=True)
            
        print("Sleeping for 60 minutes...", flush=True)
        time.sleep(3600)

if __name__ == "__main__":
    main()
