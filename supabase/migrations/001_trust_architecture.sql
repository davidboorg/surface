-- Surface Trust Architecture Schema
-- This migration establishes the foundational data model with architectural
-- separation between content (signals) and identity (contribution links).
--
-- Key principle: The signals table has NO identity references. The only path
-- to contributor identity is through signal_links → contribution_identities,
-- which are protected by RLS allowing only service_role access.

-- =============================================================
-- EXTENSIONS
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- =============================================================
-- TENANTS (Organizations using Surface)
-- =============================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain_whitelist TEXT[] NOT NULL DEFAULT '{}',  -- e.g., ['company.com']
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- PROFILES (Extends Supabase auth.users)
-- =============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor', 'leadership', 'cos', 'admin')),
  default_quote_preference TEXT DEFAULT 'anonymous' CHECK (default_quote_preference IN ('anonymous', 'synthesize_only', 'attributed')),
  onboarded_at TIMESTAMPTZ,  -- NULL until they've seen the trust explainer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for tenant lookups
CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);

-- =============================================================
-- SIGNALS (Leadership-visible content — NO IDENTITY DATA)
-- =============================================================
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Content
  raw_content TEXT NOT NULL,              -- Original user input
  contribution_card JSONB,                 -- AI-refined summary shown at contribution moment
  themes TEXT[] DEFAULT '{}',              -- AI-extracted themes

  -- Quote handling
  quote_permission TEXT NOT NULL DEFAULT 'anonymous'
    CHECK (quote_permission IN ('anonymous', 'synthesize_only', 'attributed')),
  attributed_name TEXT,                    -- Only populated if quote_permission = 'attributed'

  -- Synthesis tracking
  used_in_read_id UUID,                    -- Which Read used this signal, if any
  synthesis_status TEXT DEFAULT 'pending'
    CHECK (synthesis_status IN ('pending', 'clustered', 'used', 'excluded')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- CRITICAL: No user_id, no contribution_token, no identity reference
  -- The ONLY way to link this to a user is via signal_links table
  CONSTRAINT no_direct_identity CHECK (attributed_name IS NULL OR quote_permission = 'attributed')
);

-- Indexes for common queries
CREATE INDEX idx_signals_tenant ON signals(tenant_id);
CREATE INDEX idx_signals_tenant_created ON signals(tenant_id, created_at DESC);
CREATE INDEX idx_signals_themes ON signals USING GIN(themes);
CREATE INDEX idx_signals_synthesis_status ON signals(tenant_id, synthesis_status);

-- =============================================================
-- SIGNAL_LINKS (Bridge table — SERVICE ROLE ONLY)
-- =============================================================
-- This table exists solely to enable notifications without polluting
-- the signals table with identity information.
CREATE TABLE signal_links (
  signal_id UUID PRIMARY KEY REFERENCES signals(id) ON DELETE CASCADE,
  contribution_token UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for notification lookups
CREATE INDEX idx_signal_links_token ON signal_links(contribution_token);

-- =============================================================
-- CONTRIBUTION_IDENTITIES (Identity vault — SERVICE ROLE ONLY)
-- =============================================================
-- Maps contribution_token → user_id
-- For pilot: user_id is plaintext
-- For GA: this becomes encrypted_user_ref with KMS
CREATE TABLE contribution_identities (
  contribution_token UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for GDPR deletion (find all tokens for a user)
CREATE INDEX idx_contribution_identities_user ON contribution_identities(user_id);
CREATE INDEX idx_contribution_identities_tenant ON contribution_identities(tenant_id);

-- =============================================================
-- READS (The weekly synthesis — replaces "Pulse")
-- =============================================================
CREATE TABLE reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  -- Time period covered
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Content
  narrative TEXT,                          -- The main synthesis paragraph
  top_tensions JSONB DEFAULT '[]',         -- Array of tension objects
  emerging_patterns JSONB DEFAULT '[]',    -- Emerging patterns
  recommendations JSONB DEFAULT '[]',      -- Recommended actions
  mood JSONB,                              -- { overall, shifts }
  blind_spots JSONB DEFAULT '[]',

  -- Workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
  editor_notes TEXT,                       -- Internal notes during editing

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  -- Stats at time of generation
  signal_count INT,
  contributor_count INT                    -- Unique contributors (calculated, not stored with identity)
);

CREATE INDEX idx_reads_tenant ON reads(tenant_id);
CREATE INDEX idx_reads_tenant_status ON reads(tenant_id, status);
CREATE INDEX idx_reads_tenant_published ON reads(tenant_id, published_at DESC);

-- =============================================================
-- READ_RESPONSES (Leadership responses to tensions)
-- =============================================================
CREATE TABLE read_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  read_id UUID NOT NULL REFERENCES reads(id) ON DELETE CASCADE,
  tension_index INT NOT NULL,              -- Which tension in the JSONB array
  responder_id UUID NOT NULL REFERENCES auth.users(id),

  response_type TEXT NOT NULL CHECK (response_type IN ('acknowledged', 'action_planned', 'wont_act', 'needs_discussion')),
  response_text TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(read_id, tension_index)
);

-- =============================================================
-- CONVERSATIONS (Companion chat history — user's own data)
-- =============================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  messages JSONB NOT NULL DEFAULT '[]',    -- Array of {role, content, timestamp}

  -- Did this conversation result in a contribution?
  contributed BOOLEAN DEFAULT FALSE,
  contributed_signal_id UUID REFERENCES signals(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_tenant ON conversations(tenant_id);

-- =============================================================
-- NOTIFICATIONS (Contributor notifications)
-- =============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN ('signal_used', 'read_published', 'response_received')),
  title TEXT NOT NULL,
  body TEXT,

  -- Reference data
  read_id UUID REFERENCES reads(id),
  signal_id UUID REFERENCES signals(id),

  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE read_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ----- TENANTS -----
CREATE POLICY "Users can view own tenant"
  ON tenants FOR SELECT
  USING (id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- ----- PROFILES -----
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Leadership can view tenant member names/roles"
  ON profiles FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('leadership', 'cos', 'admin')
  );

-- Service role can do anything (for backend operations)
CREATE POLICY "Service role full access to profiles"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');

-- ----- SIGNALS (THE CRITICAL ONE) -----
-- Contributors and leadership can read signals in their tenant
-- But there's NO identity data in this table to leak
CREATE POLICY "Tenant members can read signals"
  ON signals FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Only service role can insert signals (from Companion backend)
CREATE POLICY "Service role can insert signals"
  ON signals FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Only service role can update signals (for synthesis workflow)
CREATE POLICY "Service role can update signals"
  ON signals FOR UPDATE
  USING (auth.role() = 'service_role');

-- ----- SIGNAL_LINKS (SERVICE ROLE ONLY) -----
-- This is the critical security boundary
CREATE POLICY "Service role only"
  ON signal_links FOR ALL
  USING (auth.role() = 'service_role');

-- ----- CONTRIBUTION_IDENTITIES (SERVICE ROLE ONLY) -----
-- This is the critical security boundary
CREATE POLICY "Service role only"
  ON contribution_identities FOR ALL
  USING (auth.role() = 'service_role');

-- ----- READS -----
CREATE POLICY "Tenant members can read published reads"
  ON reads FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (
      status = 'published'
      OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('cos', 'admin')
    )
  );

CREATE POLICY "Service role full access to reads"
  ON reads FOR ALL
  USING (auth.role() = 'service_role');

-- ----- READ_RESPONSES -----
CREATE POLICY "Tenant members can view responses"
  ON read_responses FOR SELECT
  USING (
    read_id IN (
      SELECT id FROM reads
      WHERE tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Leadership can create responses"
  ON read_responses FOR INSERT
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('leadership', 'cos')
    AND responder_id = auth.uid()
  );

CREATE POLICY "Responders can update own responses"
  ON read_responses FOR UPDATE
  USING (responder_id = auth.uid());

-- ----- CONVERSATIONS -----
CREATE POLICY "Users can manage own conversations"
  ON conversations FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access to conversations"
  ON conversations FOR ALL
  USING (auth.role() = 'service_role');

-- ----- NOTIFICATIONS -----
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- =============================================================
-- FUNCTIONS
-- =============================================================

-- Function to create a contribution (called by service role)
-- Handles the three-table insert atomically
CREATE OR REPLACE FUNCTION create_contribution(
  p_tenant_id UUID,
  p_user_id UUID,
  p_raw_content TEXT,
  p_contribution_card JSONB,
  p_themes TEXT[],
  p_quote_permission TEXT,
  p_attributed_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_signal_id UUID;
  v_contribution_token UUID;
BEGIN
  -- Generate IDs
  v_signal_id := gen_random_uuid();
  v_contribution_token := gen_random_uuid();

  -- Insert signal (no identity)
  INSERT INTO signals (id, tenant_id, raw_content, contribution_card, themes, quote_permission, attributed_name)
  VALUES (v_signal_id, p_tenant_id, p_raw_content, p_contribution_card, p_themes, p_quote_permission, p_attributed_name);

  -- Insert signal link (bridges signal to token)
  INSERT INTO signal_links (signal_id, contribution_token)
  VALUES (v_signal_id, v_contribution_token);

  -- Insert contribution identity (bridges token to user)
  INSERT INTO contribution_identities (contribution_token, user_id, tenant_id)
  VALUES (v_contribution_token, p_user_id, p_tenant_id);

  RETURN v_signal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user_id for a signal (for notifications, service role only)
CREATE OR REPLACE FUNCTION get_signal_contributor(p_signal_id UUID)
RETURNS UUID AS $$
  SELECT ci.user_id
  FROM signal_links sl
  JOIN contribution_identities ci ON sl.contribution_token = ci.contribution_token
  WHERE sl.signal_id = p_signal_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to delete all user data (GDPR)
CREATE OR REPLACE FUNCTION delete_user_data(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_tokens UUID[];
  v_signal_ids UUID[];
BEGIN
  -- Get all contribution tokens for this user
  SELECT ARRAY_AGG(contribution_token) INTO v_tokens
  FROM contribution_identities
  WHERE user_id = p_user_id;

  -- Get all signal IDs linked to these tokens
  SELECT ARRAY_AGG(signal_id) INTO v_signal_ids
  FROM signal_links
  WHERE contribution_token = ANY(v_tokens);

  -- Delete in correct order (respecting foreign keys)
  DELETE FROM signal_links WHERE contribution_token = ANY(v_tokens);
  DELETE FROM contribution_identities WHERE user_id = p_user_id;
  DELETE FROM signals WHERE id = ANY(v_signal_ids);
  DELETE FROM conversations WHERE user_id = p_user_id;
  DELETE FROM notifications WHERE user_id = p_user_id;
  DELETE FROM profiles WHERE id = p_user_id;
  -- Note: auth.users deletion is handled by Supabase
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- AUDIT LOG (for Surface admin access tracking)
-- =============================================================
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  purpose TEXT NOT NULL,  -- Required: why this access was needed
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only service role can write to audit log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only"
  ON admin_audit_log FOR ALL
  USING (auth.role() = 'service_role');
