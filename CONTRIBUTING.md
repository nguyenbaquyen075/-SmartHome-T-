# Workflow

`main` is protected: changes land through a Pull Request, not a direct push.

## Branches

Name branches `type/short-description`, matching the commit type:

- `feat/...` — new feature
- `fix/...` — bug fix
- `perf/...` — performance
- `refactor/...` — internal cleanup, no behavior change
- `chore/...` — tooling, deps, non-code housekeeping
- `docs/...` — documentation only
- `chore/release-x.y.z` — cut when preparing a tagged release

## Commits

`type(scope): description`, English, imperative mood. Example:
`fix(admin): keep login session across a hard page reload`.

## Releases

When `main` reaches a stable point worth marking, cut `chore/release-x.y.z`,
bump the `version` fields in `package.json` / `frontend/package.json` /
`backend/package.json`, open a PR, merge, then tag the merge commit:

```
git tag -a vx.y.z -m "vx.y.z"
git push origin vx.y.z
```

## Dependencies

Dependabot opens a PR automatically each week for outdated npm packages
(root, `frontend/`, `backend/`). Review and merge like any other PR.
