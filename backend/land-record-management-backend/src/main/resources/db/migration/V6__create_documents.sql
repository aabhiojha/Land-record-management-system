CREATE TABLE documents (
    id              BIGSERIAL PRIMARY KEY,
    land_record_id  BIGINT NOT NULL REFERENCES land_records(id),
    transfer_id     BIGINT REFERENCES transfers(id),
    uploaded_by_id  BIGINT NOT NULL REFERENCES users(id),
    file_name       VARCHAR(255) NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    file_size       BIGINT NOT NULL,
    content_type    VARCHAR(100),
    document_type   VARCHAR(30) NOT NULL,
    document_hash   VARCHAR(64),
    is_verified     BOOLEAN DEFAULT false,
    verified_by_id  BIGINT REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_documents_record ON documents(land_record_id);
CREATE INDEX idx_documents_transfer ON documents(transfer_id);
