-- TASK-0560: additive; existing leads and historical notes remain untouched.
CREATE TABLE IF NOT EXISTS kazan_sales_followups (
  lead_id uuid PRIMARY KEY REFERENCES kazan_leads(id) ON DELETE CASCADE,
  stage varchar(24) NOT NULL CHECK (stage IN ('new','contacted','qualified','proposal','won','lost')),
  owner_name varchar(100) NOT NULL DEFAULT '',
  next_action text NOT NULL DEFAULT '',
  service varchar(24) NOT NULL DEFAULT 'undecided' CHECK (service IN ('undecided','discovery','diagnostic','monthly')),
  proposal_amount numeric(12,2) CHECK (proposal_amount >= 0),
  collected_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (collected_amount >= 0),
  spent_minutes integer NOT NULL DEFAULT 0 CHECK (spent_minutes BETWEEN 0 AND 525600),
  loss_reason text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
