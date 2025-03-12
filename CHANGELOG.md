# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.7] - 2022-07-26

### Added

- Added game filters gameFilters
- Game catalog catalogGames
- gameTokenCards added input parameter for filter - contract
- Adding contracts when creating a game
- Game rating

### Changed

- Changed response format of importItem method => ImportItemDto

### Fixed

- Sitemap format -> urlset

## [0.2.6] - 2022-07-26

### Added

- Added reloadTokens mutation. Reloading tokens in elastic from db
- Changed parameter type in query games from
  GamesParams to
  GameCardsParams

## [0.2.5] - 2022-07-25

### Added

- Expanded list of social networks

## [0.2.4] - 2022-07-25

### Added

- Sitemap for games and tokens
- Added GET /api/sitemap-info method

## [0.2.3] - 2022-07-21

### Added

- Renamed review owner -> review author

## [0.2.2] - 2022-07-20

### Added

- Added saving sitemap to S3

## [0.2.1] - 2022-07-20

### Added

- Added display of user who created the review

## [0.2.0] - 2022-07-18

### Added

- Blog
- Review

## [0.1.0] - 2022-06-29

### Added

- Game filters
- Added request to get similar users

### Changed

- Currency filter relative to the selected game

### Fixed

- Display of tokens in inventory when filtering by game
