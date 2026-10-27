alter type signal_category add value if not exists 'sender_identity';
alter type signal_category add value if not exists 'source_authenticity';
alter type signal_category add value if not exists 'reported_record';
alter type signal_category add value if not exists 'content_quality';

create type verification_status as enum ('VERIFIED_OFFICIAL','LIKELY_GENUINE','NEEDS_REVIEW','HIGH_RISK','CONFIRMED_SCAM');
create type check_outcome as enum ('pass','fail','unknown','not_run','user_attested');
create type entity_type as enum ('email','email_domain','phone','upi','domain','url','social_handle','bank_account');
create type entity_status as enum ('reported','confirmed','cleared');
create type org_kind as enum ('company','university','government','event_platform','nonprofit');
