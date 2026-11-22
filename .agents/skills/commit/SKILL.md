---
name: commit
description: Write a Conventional Commits message and make a commit in the Knotwork repo. Use whenever the user asks to commit, or asks for a commit message for staged or recent changes.
---

# Commit

Knotwork uses [Conventional Commits](https://www.conventionalcommits.org/).
The history is part of the bachelor thesis, so every commit should read as one
clear, reviewable step.

## When to commit

- Only when the user asks. Never commit on your own initiative.
- One logical change per commit. If the diff mixes unrelated things (e.g. a
  Docker change and a React page), propose splitting it and stage the parts
  separately with `git add <paths>`.

## Steps

1. Inspect what will be committed:
   ```bash
   git status --short
   git diff --staged
   ```
   If nothing is staged, show the user `git diff` and ask what to stage.
   Do not use `git add -A` blindly, and never stage `.env` or secrets.
2. Pick the **type** and **scope** (tables below).
3. Write the message (format below) and commit:
   ```bash
   git commit -F- <<'EOF'
   feat(api): add health endpoint with database check

   Uses @nestjs/terminus to ping Postgres so the web app can show
   whether the whole chain (web -> api -> db) is working.
   EOF
   ```
4. If a git hook fails, **fix the cause** and commit again. Never use
   `--no-verify`, and never amend a commit that has already been pushed.

## Message format

```
<type>(<scope>): <summary>

<body: why the change was made, optional for trivial commits>

<footer: BREAKING CHANGE: ..., Refs #123, optional>
```

- Summary: imperative mood ("add", not "added"), lowercase, no trailing
  period, at most 72 characters.
- Body: explain **why**, not what. The diff already shows what changed.
  Wrap lines at 72 characters.

## Types

| Type       | Use for                                                   |
| ---------- | --------------------------------------------------------- |
| `feat`     | A new user-visible capability                             |
| `fix`      | A bug fix                                                 |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or changing tests only                             |
| `docs`     | Documentation only (README, AGENTS.md, thesis notes)      |
| `build`    | Dependencies, pnpm workspace, tsconfig                    |
| `ci`       | GitHub Actions workflows                                  |
| `chore`    | Tooling and config that fits nothing above (lint, hooks)  |
| `perf`     | A performance improvement                                 |

## Scopes

| Scope    | Covers                                                           |
| -------- | ---------------------------------------------------------------- |
| `api`    | `apps/api`                                                       |
| `web`    | `apps/web`                                                       |
| `db`     | Entities, migrations, seed data                                  |
| `docker` | `compose.yaml`                                                   |
| `ci`     | `.github/`                                                       |
| `agents` | `AGENTS.md`, `CLAUDE.md`, `.agents/`, `.gemini/`                 |
| `deps`   | Dependency bumps                                                 |
| `repo`   | Root workspace config (package.json, tsconfig.base, lint config) |

Leave the scope out only when a change truly spans the whole repo.

## Examples

```
build(repo): set up pnpm workspace with strict tsconfig base
chore(repo): add eslint, prettier and git hooks
feat(api): add health endpoint with database check
feat(web): show api and database status on health page
docs(agents): add db-migration skill
ci: run lint, typecheck and tests on pull requests
```
