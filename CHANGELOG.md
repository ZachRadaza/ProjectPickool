# Changelog

## [0.1.4] - 2026-05-19

### Added
 - Background on images.

### Fixed
 - Location search when sign in user has no set location on `Search.tsx` page
 - On `ClubComp.tsx` click, url gets reset. Like on `Search.tsx` page, user click on the component and previous search is lost.
 - Choosers on `ModifyEventPopup.tsx` have improper z-indexes, causing overlaps to happen between choosers.
 - `PopupWrapper.tsx` border radius bottom was present on mobile.
 - Requested tag on `ClubComp.tsx` looked funny.

### Changed
 - Some popup heights are now bound to th ebottom of the screen.
 - Tabs on `OpenedClubPopup.tsx` now overflow with a fade.