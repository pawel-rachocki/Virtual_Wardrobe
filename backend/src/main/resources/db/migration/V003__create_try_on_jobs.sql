CREATE TABLE try_on_jobs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    replicate_job_id VARCHAR(255)  NOT NULL,
    user_id          UUID          NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    garment_id       UUID          NOT NULL REFERENCES garments(id) ON DELETE CASCADE,
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    result_url       VARCHAR(255),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_try_on_jobs_user_id ON try_on_jobs(user_id);
