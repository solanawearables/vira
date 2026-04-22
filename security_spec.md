# VIRA Security Specification

## Data Invariants
1. A symptom entry cannot exist without a `userId` that matches the authenticated user.
2. A user profile specifically for a `userId` can only be read or written by the authenticated user with that matching `userId`.
3. Identity roles are implicit based on possession of the `userId`.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **The Identity Spoof**: Create a symptom with `userId: "other_user"`. -> Expect PERMISSION_DENIED.
2. **The Profile Hijack**: Update `/users/victim_id` as `attacker_id`. -> Expect PERMISSION_DENIED.
3. **The Shadow Update**: Update a symptom with an extra `isVerified: true` field. -> Expect PERMISSION_DENIED.
4. **The Ghost Delete**: Delete another user's symptom entry. -> Expect PERMISSION_DENIED.
5. **The Resource Poison**: Send a 1MB string as a `symptom` name. -> Expect PERMISSION_DENIED.
6. **The Negative Severity**: Set `severity: -1`. -> Expect PERMISSION_DENIED.
7. **The Future Timestamp**: Set `timestamp` to 100 years in the future. -> Expect PERMISSION_DENIED.
8. **The PII Leak**: Try to `list` all users. -> Expect PERMISSION_DENIED.
9. **The Orphan Write**: Create a symptom without a `symptom` field. -> Expect PERMISSION_DENIED.
10. **The Self-Promotion**: Attempt to update a user profile field `isAdmin: true` (if it existed). -> Expect PERMISSION_DENIED.
11. **The ID Poisoning**: Create a document at `/symptoms/../../etc/passwd`. -> Expect PERMISSION_DENIED.
12. **The Query Scraping**: Attempt to list all symptoms without a `where userId == self` filter. -> Expect PERMISSION_DENIED.

## Test Runner (Draft)
A `firestore.rules.test.ts` will be implemented to verify these.
