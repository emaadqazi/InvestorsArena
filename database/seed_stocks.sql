-- ============================================
-- SEED STOCKS TABLE WITH POPULAR STOCKS
-- ============================================
-- Run this after the main schema scripts to populate stocks

-- Ensure stocks table exists with all columns
CREATE TABLE IF NOT EXISTS stocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sector_tag TEXT,
  market_cap_tier TEXT,
  current_price DECIMAL(12, 4),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS sector_tag TEXT;
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS market_cap_tier TEXT;
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS current_price DECIMAL(12, 4);

-- ============================================
-- LARGE-CAP STOCKS ($10B+ Market Cap)
-- ============================================

INSERT INTO stocks (ticker, name, sector_tag, market_cap_tier, current_price) VALUES
-- Technology
('AAPL', 'Apple Inc.', 'Technology', 'Large-Cap', 189.95),
('MSFT', 'Microsoft Corporation', 'Technology', 'Large-Cap', 378.91),
('GOOGL', 'Alphabet Inc. Class A', 'Technology', 'Large-Cap', 141.80),
('GOOG', 'Alphabet Inc. Class C', 'Technology', 'Large-Cap', 143.05),
('AMZN', 'Amazon.com Inc.', 'Technology', 'Large-Cap', 178.25),
('NVDA', 'NVIDIA Corporation', 'Technology', 'Large-Cap', 475.50),
('META', 'Meta Platforms Inc.', 'Technology', 'Large-Cap', 505.75),
('TSLA', 'Tesla Inc.', 'Technology', 'Large-Cap', 238.45),
('AVGO', 'Broadcom Inc.', 'Technology', 'Large-Cap', 922.50),
('ORCL', 'Oracle Corporation', 'Technology', 'Large-Cap', 117.80),
('CRM', 'Salesforce Inc.', 'Technology', 'Large-Cap', 263.90),
('ADBE', 'Adobe Inc.', 'Technology', 'Large-Cap', 548.20),
('CSCO', 'Cisco Systems Inc.', 'Technology', 'Large-Cap', 48.75),
('ACN', 'Accenture plc', 'Technology', 'Large-Cap', 338.65),
('IBM', 'International Business Machines', 'Technology', 'Large-Cap', 163.40),
('INTC', 'Intel Corporation', 'Technology', 'Large-Cap', 44.25),
('AMD', 'Advanced Micro Devices Inc.', 'Technology', 'Large-Cap', 119.80),
('QCOM', 'Qualcomm Inc.', 'Technology', 'Large-Cap', 128.90),
('TXN', 'Texas Instruments Inc.', 'Technology', 'Large-Cap', 161.35),
('AMAT', 'Applied Materials Inc.', 'Technology', 'Large-Cap', 152.70),

-- Healthcare
('JNJ', 'Johnson & Johnson', 'Healthcare', 'Large-Cap', 156.80),
('UNH', 'UnitedHealth Group Inc.', 'Healthcare', 'Large-Cap', 527.45),
('PFE', 'Pfizer Inc.', 'Healthcare', 'Large-Cap', 28.95),
('LLY', 'Eli Lilly and Company', 'Healthcare', 'Large-Cap', 598.20),
('MRK', 'Merck & Co. Inc.', 'Healthcare', 'Large-Cap', 103.75),
('ABBV', 'AbbVie Inc.', 'Healthcare', 'Large-Cap', 154.30),
('TMO', 'Thermo Fisher Scientific', 'Healthcare', 'Large-Cap', 528.90),
('ABT', 'Abbott Laboratories', 'Healthcare', 'Large-Cap', 103.25),
('DHR', 'Danaher Corporation', 'Healthcare', 'Large-Cap', 232.15),
('BMY', 'Bristol-Myers Squibb', 'Healthcare', 'Large-Cap', 51.40),

-- Finance
('JPM', 'JPMorgan Chase & Co.', 'Finance', 'Large-Cap', 170.25),
('V', 'Visa Inc.', 'Finance', 'Large-Cap', 261.80),
('MA', 'Mastercard Inc.', 'Finance', 'Large-Cap', 428.50),
('BAC', 'Bank of America Corp.', 'Finance', 'Large-Cap', 33.45),
('WFC', 'Wells Fargo & Company', 'Finance', 'Large-Cap', 45.80),
('GS', 'Goldman Sachs Group Inc.', 'Finance', 'Large-Cap', 378.90),
('MS', 'Morgan Stanley', 'Finance', 'Large-Cap', 87.65),
('BLK', 'BlackRock Inc.', 'Finance', 'Large-Cap', 815.40),
('C', 'Citigroup Inc.', 'Finance', 'Large-Cap', 47.25),
('AXP', 'American Express Company', 'Finance', 'Large-Cap', 178.60),

-- Consumer
('WMT', 'Walmart Inc.', 'Consumer', 'Large-Cap', 165.30),
('PG', 'Procter & Gamble Co.', 'Consumer', 'Large-Cap', 149.85),
('KO', 'Coca-Cola Company', 'Consumer', 'Large-Cap', 59.25),
('PEP', 'PepsiCo Inc.', 'Consumer', 'Large-Cap', 168.40),
('COST', 'Costco Wholesale Corp.', 'Consumer', 'Large-Cap', 592.75),
('MCD', 'McDonald''s Corporation', 'Consumer', 'Large-Cap', 282.90),
('NKE', 'Nike Inc.', 'Consumer', 'Large-Cap', 106.45),
('SBUX', 'Starbucks Corporation', 'Consumer', 'Large-Cap', 94.80),
('HD', 'Home Depot Inc.', 'Consumer', 'Large-Cap', 345.60),
('LOW', 'Lowe''s Companies Inc.', 'Consumer', 'Large-Cap', 218.35),

-- Energy
('XOM', 'Exxon Mobil Corporation', 'Energy', 'Large-Cap', 103.85),
('CVX', 'Chevron Corporation', 'Energy', 'Large-Cap', 147.90),
('COP', 'ConocoPhillips', 'Energy', 'Large-Cap', 115.25),
('SLB', 'Schlumberger Limited', 'Energy', 'Large-Cap', 48.65),
('EOG', 'EOG Resources Inc.', 'Energy', 'Large-Cap', 118.40),

-- Industrial
('CAT', 'Caterpillar Inc.', 'Industrial', 'Large-Cap', 285.70),
('GE', 'General Electric Company', 'Industrial', 'Large-Cap', 118.45),
('HON', 'Honeywell International', 'Industrial', 'Large-Cap', 197.30),
('UPS', 'United Parcel Service', 'Industrial', 'Large-Cap', 156.85),
('RTX', 'RTX Corporation', 'Industrial', 'Large-Cap', 82.40),
('BA', 'Boeing Company', 'Industrial', 'Large-Cap', 208.75),
('LMT', 'Lockheed Martin Corp.', 'Industrial', 'Large-Cap', 452.60),
('DE', 'Deere & Company', 'Industrial', 'Large-Cap', 378.25)

ON CONFLICT (ticker) DO UPDATE SET
  name = EXCLUDED.name,
  sector_tag = EXCLUDED.sector_tag,
  market_cap_tier = EXCLUDED.market_cap_tier,
  current_price = EXCLUDED.current_price,
  updated_at = NOW();

-- ============================================
-- MID-CAP STOCKS ($2B - $10B Market Cap)
-- ============================================

INSERT INTO stocks (ticker, name, sector_tag, market_cap_tier, current_price) VALUES
-- Technology
('SNAP', 'Snap Inc.', 'Technology', 'Mid-Cap', 16.45),
('PINS', 'Pinterest Inc.', 'Technology', 'Mid-Cap', 32.80),
('TWLO', 'Twilio Inc.', 'Technology', 'Mid-Cap', 62.35),
('NET', 'Cloudflare Inc.', 'Technology', 'Mid-Cap', 78.90),
('DDOG', 'Datadog Inc.', 'Technology', 'Mid-Cap', 118.45),
('ZS', 'Zscaler Inc.', 'Technology', 'Mid-Cap', 195.20),
('OKTA', 'Okta Inc.', 'Technology', 'Mid-Cap', 82.75),
('MDB', 'MongoDB Inc.', 'Technology', 'Mid-Cap', 385.40),
('CRWD', 'CrowdStrike Holdings', 'Technology', 'Mid-Cap', 215.60),
('SPLK', 'Splunk Inc.', 'Technology', 'Mid-Cap', 148.90),

-- Healthcare
('DXCM', 'DexCom Inc.', 'Healthcare', 'Mid-Cap', 92.45),
('ALGN', 'Align Technology Inc.', 'Healthcare', 'Mid-Cap', 285.30),
('HOLX', 'Hologic Inc.', 'Healthcare', 'Mid-Cap', 68.75),
('TECH', 'Bio-Techne Corporation', 'Healthcare', 'Mid-Cap', 72.40),
('EXAS', 'Exact Sciences Corp.', 'Healthcare', 'Mid-Cap', 68.95),

-- Finance
('LPLA', 'LPL Financial Holdings', 'Finance', 'Mid-Cap', 245.80),
('RJF', 'Raymond James Financial', 'Finance', 'Mid-Cap', 108.35),
('SEIC', 'SEI Investments Company', 'Finance', 'Mid-Cap', 65.20),
('VOYA', 'Voya Financial Inc.', 'Finance', 'Mid-Cap', 72.45),
('ALLY', 'Ally Financial Inc.', 'Finance', 'Mid-Cap', 32.80),

-- Consumer
('LULU', 'Lululemon Athletica', 'Consumer', 'Mid-Cap', 425.60),
('ULTA', 'Ulta Beauty Inc.', 'Consumer', 'Mid-Cap', 445.30),
('RH', 'RH (Restoration Hardware)', 'Consumer', 'Mid-Cap', 285.75),
('DECK', 'Deckers Outdoor Corp.', 'Consumer', 'Mid-Cap', 645.20),
('WSM', 'Williams-Sonoma Inc.', 'Consumer', 'Mid-Cap', 165.40),

-- Energy
('MPC', 'Marathon Petroleum Corp.', 'Energy', 'Mid-Cap', 148.65),
('VLO', 'Valero Energy Corp.', 'Energy', 'Mid-Cap', 128.90),
('PSX', 'Phillips 66', 'Energy', 'Mid-Cap', 118.45),
('DVN', 'Devon Energy Corp.', 'Energy', 'Mid-Cap', 45.80),
('FANG', 'Diamondback Energy Inc.', 'Energy', 'Mid-Cap', 158.25),

-- Industrial
('WAB', 'Westinghouse Air Brake', 'Industrial', 'Mid-Cap', 125.40),
('IR', 'Ingersoll Rand Inc.', 'Industrial', 'Mid-Cap', 78.65),
('PNR', 'Pentair plc', 'Industrial', 'Mid-Cap', 72.30),
('XYL', 'Xylem Inc.', 'Industrial', 'Mid-Cap', 112.85),
('RBC', 'RBC Bearings Inc.', 'Industrial', 'Mid-Cap', 265.40)

ON CONFLICT (ticker) DO UPDATE SET
  name = EXCLUDED.name,
  sector_tag = EXCLUDED.sector_tag,
  market_cap_tier = EXCLUDED.market_cap_tier,
  current_price = EXCLUDED.current_price,
  updated_at = NOW();

-- ============================================
-- SMALL-CAP STOCKS (Under $2B Market Cap)
-- ============================================

INSERT INTO stocks (ticker, name, sector_tag, market_cap_tier, current_price) VALUES
-- Technology
('BMBL', 'Bumble Inc.', 'Technology', 'Small-Cap', 12.45),
('APPS', 'Digital Turbine Inc.', 'Technology', 'Small-Cap', 6.85),
('SMAR', 'Smartsheet Inc.', 'Technology', 'Small-Cap', 42.30),
('APPN', 'Appian Corporation', 'Technology', 'Small-Cap', 35.75),
('BAND', 'Bandwidth Inc.', 'Technology', 'Small-Cap', 18.90),
('BLZE', 'Backblaze Inc.', 'Technology', 'Small-Cap', 8.45),
('CWAN', 'Clearwater Analytics', 'Technology', 'Small-Cap', 18.65),
('FRSH', 'Freshworks Inc.', 'Technology', 'Small-Cap', 15.80),
('VTEX', 'VTEX', 'Technology', 'Small-Cap', 7.25),
('BRZE', 'Braze Inc.', 'Technology', 'Small-Cap', 48.90),

-- Healthcare
('AXSM', 'Axsome Therapeutics', 'Healthcare', 'Small-Cap', 72.45),
('PCVX', 'Vaxcyte Inc.', 'Healthcare', 'Small-Cap', 68.30),
('KRYS', 'Krystal Biotech Inc.', 'Healthcare', 'Small-Cap', 145.60),
('NUVB', 'Nuvation Bio Inc.', 'Healthcare', 'Small-Cap', 4.85),
('ARWR', 'Arrowhead Pharma Corp.', 'Healthcare', 'Small-Cap', 28.75),
('CRNX', 'Crinetics Pharmaceuticals', 'Healthcare', 'Small-Cap', 45.20),
('BHVN', 'Biohaven Ltd.', 'Healthcare', 'Small-Cap', 42.65),
('RCKT', 'Rocket Pharmaceuticals', 'Healthcare', 'Small-Cap', 22.40),
('DAWN', 'Day One Biopharm.', 'Healthcare', 'Small-Cap', 18.75),
('IMVT', 'Immunovant Inc.', 'Healthcare', 'Small-Cap', 35.80),

-- Finance
('ESNT', 'Essent Group Ltd.', 'Finance', 'Small-Cap', 52.45),
('MBIN', 'Merchants Bancshares', 'Finance', 'Small-Cap', 38.90),
('LOB', 'Live Oak Bancshares', 'Finance', 'Small-Cap', 42.35),
('CADE', 'Cadence Bank', 'Finance', 'Small-Cap', 28.65),
('PNFP', 'Pinnacle Financial', 'Finance', 'Small-Cap', 85.40),

-- Consumer
('BIRD', 'Allbirds Inc.', 'Consumer', 'Small-Cap', 1.25),
('COOK', 'Traeger Inc.', 'Consumer', 'Small-Cap', 3.45),
('PRPL', 'Purple Innovation', 'Consumer', 'Small-Cap', 2.80),
('LOVE', 'Lovesac Company', 'Consumer', 'Small-Cap', 28.65),
('PLBY', 'PLBY Group Inc.', 'Consumer', 'Small-Cap', 1.85),
('GOOS', 'Canada Goose Holdings', 'Consumer', 'Small-Cap', 12.45),
('CROX', 'Crocs Inc.', 'Consumer', 'Small-Cap', 98.75),
('SKX', 'Skechers U.S.A. Inc.', 'Consumer', 'Small-Cap', 58.40),
('WOOF', 'Petco Health & Wellness', 'Consumer', 'Small-Cap', 3.25),
('CHWY', 'Chewy Inc.', 'Consumer', 'Small-Cap', 18.90),

-- Energy
('ESTE', 'Earthstone Energy', 'Energy', 'Small-Cap', 14.25),
('MTDR', 'Matador Resources Co.', 'Energy', 'Small-Cap', 58.40),
('CIVI', 'Civitas Resources Inc.', 'Energy', 'Small-Cap', 68.75),
('CHRD', 'Chord Energy Corp.', 'Energy', 'Small-Cap', 165.30),
('GPOR', 'Gulfport Energy Corp.', 'Energy', 'Small-Cap', 128.45),

-- Industrial
('GFF', 'Griffon Corporation', 'Industrial', 'Small-Cap', 58.90),
('AIMC', 'Altra Industrial Motion', 'Industrial', 'Small-Cap', 52.35),
('MATX', 'Matson Inc.', 'Industrial', 'Small-Cap', 98.75),
('POWL', 'Powell Industries', 'Industrial', 'Small-Cap', 125.40),
('SPXC', 'SPX Technologies Inc.', 'Industrial', 'Small-Cap', 92.65)

ON CONFLICT (ticker) DO UPDATE SET
  name = EXCLUDED.name,
  sector_tag = EXCLUDED.sector_tag,
  market_cap_tier = EXCLUDED.market_cap_tier,
  current_price = EXCLUDED.current_price,
  updated_at = NOW();

-- ============================================
-- ADD RLS POLICY FOR STOCKS
-- ============================================

ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dev_all_access_stocks ON stocks;
CREATE POLICY "dev_all_access_stocks" ON stocks FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ Stocks table seeded successfully!';
    RAISE NOTICE '📊 Added Large-Cap, Mid-Cap, and Small-Cap stocks across all sectors';
END $$;

SELECT 
  market_cap_tier,
  COUNT(*) as stock_count
FROM stocks
GROUP BY market_cap_tier
ORDER BY 
  CASE market_cap_tier 
    WHEN 'Large-Cap' THEN 1 
    WHEN 'Mid-Cap' THEN 2 
    WHEN 'Small-Cap' THEN 3 
  END;
