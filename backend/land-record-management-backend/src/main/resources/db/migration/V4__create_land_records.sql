CREATE TABLE land_records (
    id                  BIGSERIAL PRIMARY KEY,
    kitta_number        VARCHAR(50) NOT NULL UNIQUE,
    area_sq_meters      DOUBLE PRECISION NOT NULL,
    district            VARCHAR(100) NOT NULL,
    municipality        VARCHAR(200) NOT NULL,
    ward_number         INTEGER NOT NULL,
    land_type           VARCHAR(20) NOT NULL,
    current_owner_id    BIGINT NOT NULL REFERENCES users(id),
    record_hash         VARCHAR(64),
    previous_record_hash VARCHAR(64),
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMP DEFAULT now(),
    updated_at          TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_land_records_kitta ON land_records(kitta_number);
CREATE INDEX idx_land_records_district ON land_records(district);
CREATE INDEX idx_land_records_owner ON land_records(current_owner_id);

CREATE TABLE ownership_history (
    id              BIGSERIAL PRIMARY KEY,
    land_record_id  BIGINT NOT NULL REFERENCES land_records(id),
    owner_id        BIGINT NOT NULL REFERENCES users(id),
    transfer_id     BIGINT,
    record_hash     VARCHAR(64),
    owned_from      TIMESTAMP NOT NULL DEFAULT now(),
    owned_until     TIMESTAMP
);

CREATE INDEX idx_ownership_land ON ownership_history(land_record_id);
CREATE INDEX idx_ownership_owner ON ownership_history(owner_id);

CREATE TABLE merkle_nodes (
    id              BIGSERIAL PRIMARY KEY,
    hash_value      VARCHAR(64) NOT NULL,
    left_child_id   BIGINT REFERENCES merkle_nodes(id),
    right_child_id  BIGINT REFERENCES merkle_nodes(id),
    parent_id       BIGINT REFERENCES merkle_nodes(id),
    node_level      INTEGER NOT NULL,
    node_position   INTEGER NOT NULL,
    is_leaf         BOOLEAN NOT NULL,
    land_record_id  BIGINT REFERENCES land_records(id),
    tree_version    INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_merkle_version ON merkle_nodes(tree_version);
CREATE INDEX idx_merkle_leaf ON merkle_nodes(land_record_id) WHERE is_leaf = true;
