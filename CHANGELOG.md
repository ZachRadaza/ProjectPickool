# Changelog

## [0.2.3] - 2026-05-25

### Added
 - `current_players` to Event queries to display the current number of players.

### Fixed
 - Creating Club hangs on `ModifyClubPopup.tsx` when attempting to create a club.
 - Awkward spacing with usernames with spaces.
 - Multi-line username on `UsersDropdown.tsx` causing alignment issues.
 - Log out button on Users says `Loggin Out` instead of `Logging Out`.

### Changed
 - `EventType` replaced `casual` as `open play`.
 - `SexType` now has `any`.
 - `End Time` input is not `Duration (in hours)` on `ModifyEventPopup.tsx`.