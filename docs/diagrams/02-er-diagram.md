# Entity Relationship / Database Schema Diagram

**Report section:** 4.1 Database Design

Full physical schema reverse-engineered from the PostgreSQL database
(`flyway_schema_history` is Flyway's migration bookkeeping table). Arrows are
foreign-key references (`column : referenced_column`). Rendered with the light
theme on a white background.

```mermaid
%%{init: {'theme': 'default', 'themeVariables': {'fontSize': '14px'}}}%%
classDiagram
direction TB
class audit_log {
   bigint user_id
   varchar(50) action
   varchar(50) entity_type
   bigint entity_id
   text details
   varchar(45) ip_address
   timestamp created_at
   bigint id
}
class documents {
   bigint land_record_id
   bigint transfer_id
   bigint uploaded_by_id
   varchar(255) file_name
   varchar(500) file_path
   bigint file_size
   varchar(100) content_type
   varchar(30) document_type
   varchar(64) document_hash
   boolean is_verified
   bigint verified_by_id
   timestamp created_at
   bigint id
}
class flyway_schema_history {
   varchar(50) version
   varchar(200) description
   varchar(20) type
   varchar(1000) script
   integer checksum
   varchar(100) installed_by
   timestamp installed_on
   integer execution_time
   boolean success
   integer installed_rank
}
class land_records {
   varchar(50) kitta_number
   double precision area_sq_meters
   varchar(100) district
   varchar(200) municipality
   integer ward_number
   varchar(20) land_type
   bigint current_owner_id
   varchar(64) record_hash
   varchar(64) previous_record_hash
   boolean is_active
   timestamp created_at
   timestamp updated_at
   bigint id
}
class merkle_nodes {
   varchar(64) hash_value
   bigint left_child_id
   bigint right_child_id
   bigint parent_id
   integer node_level
   integer node_position
   boolean is_leaf
   bigint land_record_id
   integer tree_version
   timestamp created_at
   bigint id
}
class ownership_history {
   bigint land_record_id
   bigint owner_id
   bigint transfer_id
   varchar(64) record_hash
   timestamp owned_from
   timestamp owned_until
   bigint id
}
class transfers {
   bigint land_record_id
   bigint seller_id
   bigint buyer_id
   varchar(30) status
   timestamp initiated_at
   timestamp officer_verified_at
   bigint verified_by_officer_id
   timestamp admin_approved_at
   bigint approved_by_admin_id
   text rejection_reason
   varchar(64) old_record_hash
   varchar(64) new_record_hash
   bigint id
}
class users {
   varchar(255) full_name
   varchar(255) email
   varchar(255) password_hash
   varchar(20) phone
   varchar(50) citizenship_number
   varchar(20) role
   varchar(100) district
   boolean is_active
   timestamp created_at
   timestamp updated_at
   bigint id
}

audit_log  -->  users : user_id → id
documents  -->  land_records : land_record_id → id
documents  -->  transfers : transfer_id → id
documents  -->  users : uploaded_by_id → id
documents  -->  users : verified_by_id → id
land_records  -->  users : current_owner_id → id
merkle_nodes  -->  land_records : land_record_id → id
merkle_nodes  -->  merkle_nodes : parent_id → id
merkle_nodes  -->  merkle_nodes : right_child_id → id
merkle_nodes  -->  merkle_nodes : left_child_id → id
ownership_history  -->  land_records : land_record_id → id
ownership_history  -->  transfers : transfer_id → id
ownership_history  -->  users : owner_id → id
transfers  -->  land_records : land_record_id → id
transfers  -->  users : seller_id → id
transfers  -->  users : verified_by_officer_id → id
transfers  -->  users : buyer_id → id
transfers  -->  users : approved_by_admin_id → id
```
