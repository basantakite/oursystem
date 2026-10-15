-- =========================================================================
-- SUPER ADMIN & MULTI-TENANT VOTER MANAGEMENT SYSTEM — SUPABASE SCHEMA
-- Voter Management System | वास्तविक डेटा, Tenant व्यवस्थापन र सुरक्षित पहुँच
--
-- Official Voter Roll Columns:
--   S.N. (serial_no) | Voter ID (voter_id) | Full Name (full_name) | Age (age) |
--   Gender (gender)  | Spouse Name (spouse_name) | Father Name (father_name) | Mother Name (mother_name)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_settings (key, value) VALUES
  ('admin_pin', '"1234"'),
  ('election_day_mode', 'false'),
  ('municipality_name', '"Helambu Rural Municipality"'),
  ('public_form_enabled', 'true'),
  ('household_module_enabled', 'true'),
  ('notices_enabled', 'true'),
  ('messages_enabled', 'true'),
  ('notes_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- 2. PLANS & SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS plans (
  plan_id VARCHAR(50) PRIMARY KEY,
  plan_name VARCHAR(100) NOT NULL,
  max_voters INT DEFAULT 100000,
  max_users INT DEFAULT 100,
  sms_quota INT DEFAULT 5000,
  features JSONB DEFAULT '{"bulk_import": false, "export": false, "war_room": true, "sms": true}',
  monthly_price NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO plans (plan_id, plan_name, max_voters, max_users, sms_quota, features, monthly_price) VALUES
  ('PLAN_STANDARD', 'Standard Palika', 50000, 50, 5000, '{"bulk_import": false, "export": false, "war_room": true, "sms": true}', 25000.00),
  ('PLAN_ENTERPRISE', 'Enterprise Election HQ', 250000, 250, 25000, '{"bulk_import": false, "export": true, "war_room": true, "sms": true}', 60000.00)
ON CONFLICT (plan_id) DO NOTHING;

-- 3. TENANTS (Organizations, Municipalities, Campaigns)
-- Note: Tenant != Palika. Multiple tenants can operate in the same Palika!
CREATE TABLE IF NOT EXISTS tenants (
  tenant_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  province VARCHAR(100) DEFAULT 'Bagmati',
  district VARCHAR(100) NOT NULL DEFAULT 'Sindhupalchok',
  palika VARCHAR(150) NOT NULL DEFAULT 'Helambu Rural Municipality',
  admin_name VARCHAR(150) NOT NULL,
  admin_phone VARCHAR(30) NOT NULL,
  admin_username VARCHAR(100) UNIQUE,
  account_status VARCHAR(50) DEFAULT 'Active', -- 'Pending Setup', 'Active', 'Suspended', 'Archived'
  subscription_status VARCHAR(50) DEFAULT 'Current', -- 'Current', 'Expired'
  plan_id VARCHAR(50) REFERENCES plans(plan_id) ON DELETE SET NULL,
  expiry_date DATE,
  branding JSONB DEFAULT '{"party": "NC", "primary_color": "#059669", "logo_url": ""}',
  sms_balance INT DEFAULT 5000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Tenant for Helambu Rural Municipality
INSERT INTO tenants (tenant_id, name, slug, province, district, palika, admin_name, admin_phone, admin_username, account_status, subscription_status, plan_id, branding, sms_balance)
VALUES (
  'TNT_HELAMBU',
  'Helambu Rural Municipality Election HQ',
  'helambu',
  'Bagmati',
  'Sindhupalchok',
  'Helambu Rural Municipality',
  'Helambu Admin',
  '9841201000',
  'admin_helambu',
  'Active',
  'Current',
  'PLAN_ENTERPRISE',
  '{"party": "NC", "primary_color": "#059669", "symbol": "🌳"}',
  10000
) ON CONFLICT (tenant_id) DO NOTHING;

-- 4. USERS (Super Admin, Palika/Tenant Admin, Coordinators, Booth Reps)
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Field Worker', -- 'Super Admin', 'Palika Admin', 'Booth Field Staff'
  pin VARCHAR(10) NOT NULL DEFAULT '1234',
  access_token VARCHAR(64) UNIQUE,
  ward VARCHAR(20) DEFAULT 'All',
  tole VARCHAR(100) DEFAULT '',
  booth_no VARCHAR(50) DEFAULT 'A',
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Super Admin HQ User
INSERT INTO users (user_id, tenant_id, name, phone, role, pin, ward, active, notes)
VALUES (
  'USR_SUPER_ADMIN_HQ',
  'TNT_HELAMBU',
  'Central Super Admin HQ',
  '9851170967',
  'Super Admin',
  '1234',
  'All',
  true,
  'Master Platform Super Administrator'
) ON CONFLICT (user_id) DO NOTHING;

-- 5. WARDS
CREATE TABLE IF NOT EXISTS wards (
  ward_id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  ward_no INT NOT NULL,
  municipality VARCHAR(100) NOT NULL DEFAULT 'Helambu Rural Municipality',
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT '',
  CONSTRAINT uq_tenant_ward UNIQUE(tenant_id, ward_no)
);

-- 6. TOLES
CREATE TABLE IF NOT EXISTS toles (
  tole_id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  ward_no INT NOT NULL,
  tole_name VARCHAR(150) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT ''
);

-- 7. POLLING LOCATIONS (मतदान स्थल - विद्यालय, भवन, स्थान)
CREATE TABLE IF NOT EXISTS polling_locations (
  polling_location_id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  ward_no INT NOT NULL,
  location_name VARCHAR(200) NOT NULL,
  location_code VARCHAR(50) DEFAULT '',
  address TEXT DEFAULT '',
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT ''
);

-- 8. POLLING CENTRES (मतदान केन्द्र - 'क', 'ख', 'ग' वा एकल केन्द्र)
CREATE TABLE IF NOT EXISTS polling_centers (
  polling_center_id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  ward_no INT NOT NULL,
  polling_location_id VARCHAR(50) REFERENCES polling_locations(polling_location_id) ON DELETE SET NULL,
  center_code VARCHAR(20) NOT NULL, -- e.g. 'क', 'ख' वा 'A', 'B'
  center_name VARCHAR(150) NOT NULL,
  official_expected_count INT DEFAULT 0,
  imported_count INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT ''
);

-- Legacy Booths compatibility table
CREATE TABLE IF NOT EXISTS booths (
  booth_id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  ward_no INT NOT NULL,
  polling_location_id VARCHAR(50) REFERENCES polling_locations(polling_location_id) ON DELETE SET NULL,
  booth_code VARCHAR(20) NOT NULL,
  booth_name VARCHAR(150) NOT NULL,
  registered_count INT DEFAULT 0,
  male_count INT DEFAULT 0,
  female_count INT DEFAULT 0,
  other_count INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT ''
);

-- 9. IMPORT BATCHES (Exclusive Super Admin Audit & Rollback Trail)
CREATE TABLE IF NOT EXISTS import_batches (
  batch_id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  import_type VARCHAR(50) NOT NULL, -- 'single_centre', 'whole_ward', 'whole_palika'
  target_ward INT,
  target_location_id VARCHAR(50),
  target_center_id VARCHAR(50),
  voter_roll_version VARCHAR(100) DEFAULT '2081_Baisakh',
  total_rows INT DEFAULT 0,
  success_count INT DEFAULT 0,
  updated_count INT DEFAULT 0,
  skipped_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Completed', -- 'Completed', 'Reverted', 'Failed'
  imported_by VARCHAR(150) DEFAULT 'Super Admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. VOTERS (Electoral Roll with Strict Multi-Tenancy & Batch Tracking)
CREATE TABLE IF NOT EXISTS voters (
  id UUID DEFAULT uuid_generate_v4(),
  voter_id VARCHAR(50) NOT NULL, -- Official Voter ID (Text to preserve leading zeroes)
  tenant_id VARCHAR(50) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  serial_no VARCHAR(50) DEFAULT '',
  full_name VARCHAR(150) NOT NULL,
  age INT,
  gender VARCHAR(20) DEFAULT '',
  spouse_name VARCHAR(150) DEFAULT '',
  father_name VARCHAR(150) DEFAULT '',
  mother_name VARCHAR(150) DEFAULT '',
  phone VARCHAR(20) DEFAULT '',
  age_group VARCHAR(20) DEFAULT '',
  municipality VARCHAR(100) DEFAULT 'Helambu Rural Municipality',
  ward_no INT NOT NULL DEFAULT 1,
  tole VARCHAR(100) DEFAULT '',
  block_cluster VARCHAR(100) DEFAULT '',
  polling_location_id VARCHAR(50) REFERENCES polling_locations(polling_location_id) ON DELETE SET NULL,
  polling_center_id VARCHAR(50) REFERENCES polling_centers(polling_center_id) ON DELETE SET NULL,
  booth_no VARCHAR(50) DEFAULT 'A',
  voter_serial VARCHAR(50) DEFAULT '',
  dob DATE,
  party_leaning VARCHAR(50) DEFAULT 'Undecided',
  sentiment VARCHAR(50) DEFAULT 'swing',
  support_level VARCHAR(50) DEFAULT 'Neutral',
  influence_level VARCHAR(50) DEFAULT 'Normal',
  voted_status BOOLEAN DEFAULT FALSE,
  voted_time TIMESTAMP WITH TIME ZONE,
  facebook_url VARCHAR(255) DEFAULT '',
  tiktok_url VARCHAR(255) DEFAULT '',
  record_source VARCHAR(50) DEFAULT 'Super Admin Bulk Import',
  voter_roll_version VARCHAR(100) DEFAULT '2081_Baisakh',
  import_batch_id VARCHAR(50) REFERENCES import_batches(batch_id) ON DELETE SET NULL,
  verification_status VARCHAR(50) DEFAULT 'Verified',
  contact_status VARCHAR(50) DEFAULT 'Not Contacted',
  self_reported_response VARCHAR(50) DEFAULT '',
  response_date TIMESTAMP WITH TIME ZONE,
  response_source VARCHAR(50) DEFAULT '',
  assigned_user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT '',
  created_by VARCHAR(50) DEFAULT 'SUPER_ADMIN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(50) DEFAULT 'SUPER_ADMIN',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tenant_id, voter_id, voter_roll_version)
);

-- =========================================================================
-- IDEMPOTENT MIGRATIONS FOR EXISTING SUPABASE INSTANCES
-- Safely adds multi-tenant columns to existing deployments without data loss!
-- =========================================================================

ALTER TABLE voters ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) DEFAULT 'TNT_HELAMBU';
ALTER TABLE voters ADD COLUMN IF NOT EXISTS polling_center_id VARCHAR(50);
ALTER TABLE voters ADD COLUMN IF NOT EXISTS voter_roll_version VARCHAR(100) DEFAULT '2081_Baisakh';
ALTER TABLE voters ADD COLUMN IF NOT EXISTS import_batch_id VARCHAR(50);

ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) DEFAULT 'TNT_HELAMBU';
ALTER TABLE wards ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) DEFAULT 'TNT_HELAMBU';
ALTER TABLE toles ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) DEFAULT 'TNT_HELAMBU';
ALTER TABLE polling_locations ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) DEFAULT 'TNT_HELAMBU';
ALTER TABLE booths ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) DEFAULT 'TNT_HELAMBU';

-- Ensure existing voters are associated with the Helambu tenant
UPDATE voters SET tenant_id = 'TNT_HELAMBU' WHERE tenant_id IS NULL;
UPDATE users SET tenant_id = 'TNT_HELAMBU' WHERE tenant_id IS NULL;

-- INDEXES FOR INSTANT SUB-SECOND QUERYING ACROSS TENANTS
CREATE INDEX IF NOT EXISTS idx_voters_tenant_ward ON voters(tenant_id, ward_no);
CREATE INDEX IF NOT EXISTS idx_voters_tenant_voter_id ON voters(tenant_id, voter_id);
CREATE INDEX IF NOT EXISTS idx_voters_batch_id ON voters(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_voters_voted_status ON voters(tenant_id, voted_status);
CREATE INDEX IF NOT EXISTS idx_voters_phone ON voters(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_batches_tenant ON import_batches(tenant_id);

-- SEED HELAMBU WARDS (1 to 7) FOR TNT_HELAMBU
INSERT INTO wards (ward_id, tenant_id, ward_no, municipality, active, notes)
VALUES
  ('WARD_01', 'TNT_HELAMBU', 1, 'Helambu Rural Municipality', true, 'Melamchighyang / Tarkeghyang'),
  ('WARD_02', 'TNT_HELAMBU', 2, 'Helambu Rural Municipality', true, 'Kiul / Gairitole'),
  ('WARD_03', 'TNT_HELAMBU', 3, 'Helambu Rural Municipality', true, 'Sermathang / Palchok'),
  ('WARD_04', 'TNT_HELAMBU', 4, 'Helambu Rural Municipality', true, 'Gyalthum'),
  ('WARD_05', 'TNT_HELAMBU', 5, 'Helambu Rural Municipality', true, 'Chanaute / Mahankal'),
  ('WARD_06', 'TNT_HELAMBU', 6, 'Helambu Rural Municipality', true, 'Ichok'),
  ('WARD_07', 'TNT_HELAMBU', 7, 'Helambu Rural Municipality', true, 'Banskharka')
ON CONFLICT (tenant_id, ward_no) DO NOTHING;
