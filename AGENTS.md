# Repository Guidelines

## Project Structure & Module Organization
This repository currently contains planning and configuration files at the root, including `architecture.md`, `coding-conventions.md`, `service-api.md`, `project.config.json`, and `cloudbaserc.json`. The target application structure, defined in `architecture.md`, uses `miniprogram/` for the WeChat Mini Program client and `cloudfunctions/` for CloudBase functions. Keep page code under `miniprogram/pages/`, shared logic under `miniprogram/services/` and `miniprogram/utils/`, and one function per directory under `cloudfunctions/<functionName>/`.

## Build, Test, and Development Commands
Use `npm install` at the repository root to install the CloudBase SDK dependency. There are no `npm scripts` defined yet, so local development is expected through WeChat DevTools using `project.config.json`. For cloud functions, deploy with the CloudBase CLI after authenticating, for example: `tcb functions:deploy uploadPhoto`. Use `npm ls --depth=0` to confirm the root dependency set before packaging.

## Coding Style & Naming Conventions
Follow the conventions in `coding-conventions.md`. Use 2-space indentation, camelCase for variables, functions, cloud functions, and collection names, and UPPER_SNAKE_CASE for constants. Page folders should follow the Mini Program pattern `pages/page-name/` with matching `.js`, `.json`, `.wxml`, and `.wxss` files. Prefer descriptive verb-led function names such as `getBabyProfiles` or `updatePhoto`.

## Testing Guidelines
No automated test framework is configured in this workspace yet. Validate changes in WeChat DevTools and exercise affected cloud functions against the configured CloudBase environment. When adding tests later, keep them close to the module they verify and name them after the behavior under test, for example `photoService.upload.spec.js`.

## Commit & Pull Request Guidelines
Git history is not available in this checkout, so no established commit convention can be inferred from previous commits. Use short, imperative commit messages with a clear scope, such as `feat: add photo timeline page` or `fix: handle missing OPENID`. Pull requests should summarize user-visible changes, list affected pages or cloud functions, mention any environment or schema updates, and include screenshots for UI work.

## Security & Configuration Tips
Do not hardcode secrets or alternate environment IDs in source files. Use `cloud.getWXContext()` for identity inside cloud functions and keep the active CloudBase environment aligned with `cloudbaserc.json`.
