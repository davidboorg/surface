# Surface Pipeline

Single canonical flow: **Companion → Contribution → Signals → Reads → Responses → Notifications**

---

## Route Map

### Frontend Routes

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Landing page | No |
| `/login` | Google OAuth login | No |
| `/auth/callback` | OAuth callback handler | No |
| `/onboarding` | Profile creation for new users | Yes |
| `/companion` | AI conversation interface | Yes |
| `/read` | The Read - leadership synthesis view | Yes (leadership role) |

### API Routes

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/companion` | POST | AI conversation (Claude) | No* |
| `/api/contribute` | POST | Generate card (`action=generate_card`) or submit signal (`action=submit`) | Yes |
| `/api/read` | GET | Fetch latest published Read | Yes (leadership) |
| `/api/read` | POST | Generate new Read synthesis | Yes (leadership) |

*Companion API should add auth check in Phase 2

---

## Data Flow

```
User opens /companion
        ↓
Types observation
        ↓
POST /api/companion → Claude responds
        ↓
[After 5+ messages, contribution prompt appears]
        ↓
User clicks "Surface this"
        ↓
POST /api/contribute (action=generate_card)
        → Claude extracts summary + themes
        → Returns ContributionCard
        ↓
User reviews card, selects quote permission
        ↓
POST /api/contribute (action=submit)
        → create_contribution() function called
        → Inserts into: signals, signal_links, contribution_identities
        → Identity separated by design
        ↓
[Weekly or on-demand]
        ↓
POST /api/read
        → Fetches signals from past 7 days
        → Claude synthesizes into narrative + tensions
        → Saves to reads table (status: published)
        ↓
Leadership views /read
        → GET /api/read fetches latest published Read
        → Responds to tensions (read_responses table)
        ↓
[Future: notifications to contributors]
```

---

## Database Tables (Canonical)

| Table | Purpose | Identity Visible |
|-------|---------|------------------|
| `tenants` | Multi-tenant orgs | N/A |
| `profiles` | User profiles, roles | Yes |
| `signals` | Contributed observations | **No** - no user_id |
| `signal_links` | Bridge signal → token | Service role only |
| `contribution_identities` | Token → user_id | Service role only |
| `conversations` | Chat history | Yes (user's own) |
| `reads` | Weekly synthesis | No identity |
| `read_responses` | Leadership responses | Yes (responder visible) |
| `notifications` | User notifications | Yes (user's own) |

---

## Trust Architecture

The **signals** table contains NO identity information. The only path to contributor identity:

```
signals.id → signal_links.signal_id → signal_links.contribution_token
           → contribution_identities.contribution_token → user_id
```

Both `signal_links` and `contribution_identities` have RLS policies restricting access to `service_role` only. Leadership queries against `signals` cannot join to identity.

---

## Gaps to Address (Phase 1+)

1. **Conversations not persisted from message 1** - only on contribution
2. **Single-shot synthesis** - needs clustering + multi-stage pipeline
3. **No temporal context** - Read doesn't compare to previous weeks
4. **No editor moment** - goes straight to published
5. **No response→notification flow** - read_responses exist but no notifications sent
