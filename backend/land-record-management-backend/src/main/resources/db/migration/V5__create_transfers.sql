CREATE TABLE transfers (
    id                      BIGSERIAL PRIMARY KEY,
    land_record_id          BIGINT NOT NULL REFERENCES land_records(id),
    seller_id               BIGINT NOT NULL REFERENCES users(id),
    buyer_id                BIGINT NOT NULL REFERENCES users(id),
    status                  VARCHAR(30) NOT NULL DEFAULT 'INITIATED',
    initiated_at            TIMESTAMP NOT NULL DEFAULT now(),
    officer_verified_at     TIMESTAMP,
    verified_by_officer_id  BIGINT REFERENCES users(id),
    admin_approved_at       TIMESTAMP,
    approved_by_admin_id    BIGINT REFERENCES users(id),
    rejection_reason        TEXT,
    old_record_hash         VARCHAR(64),
    new_record_hash         VARCHAR(64)
);

CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_transfers_land ON transfers(land_record_id);
CREATE INDEX idx_transfers_seller ON transfers(seller_id);
CREATE INDEX idx_transfers_buyer ON transfers(buyer_id);

ALTER TABLE ownership_history ADD CONSTRAINT fk_ownership_transfer
    FOREIGN KEY (transfer_id) REFERENCES transfers(id);
