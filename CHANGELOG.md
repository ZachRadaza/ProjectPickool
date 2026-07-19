# Changelog

## [0.4.1] - 2026-07-18

### Added
 - `Courts`(beta) page, for users to keep track or open play and tournaments sessions.
 - `AddGuestPopup.tsx` to add guests with no user account to `Courts` page.
 - Ability to import players and event information to `Courts` page.
 - Deny button on `UserHeaderMini.tsx`.
 - API to call a list of `UserHeader`'s from IDs.
 - Save temporary info on `Courts` page players through cache. 

### Fixed
 - `UserSearchPopup.tsx` getting stuck on loading after first search.
 - `UsersDropdown.tsx` not adjusting to proper height when loading users
 - Popup modals on mobile(<=480px) have their top border cut off

### Changed
 - `UsersDropdown.tsx` now has a transparent background, rather than white
 - `ClubsComp.tsx` now has a built in mini version, can be used by passing boolean variable
 - `UserHeaderComp.tsx` not handle guest IDs differently
