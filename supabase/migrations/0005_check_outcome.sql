-- Migration 0005: Add 'none_found' to check_outcome enum
ALTER TYPE check_outcome ADD VALUE IF NOT EXISTS 'none_found';
