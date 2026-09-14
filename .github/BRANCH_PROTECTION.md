# 🛡️ Branch Protection & Collaboration Guidelines

To maintain code quality and prevent accidental breaking changes, the following branch protection rules should be configured in GitHub repository settings (**Settings > Branches**).

---

## 📌 Protected Branches
1. `main` (Production Branch)
2. `development` (Integration / Staging Branch)

---

## ⚙️ Recommended Protection Rules

### 1. Require Pull Request Before Merging
- **Require approvals**: Minimum **1 approval** from a team member.
- **Dismiss stale pull request approvals when new commits are pushed**: `Enabled`
- **Require review from Code Owners**: Optional / `Enabled`

### 2. Require Status Checks to Pass Before Merging
- Enable **"Require status checks to pass before merging"**
- Require branches to be up to date before merging.
- **Required status checks**:
  - `Backend CI Checks` (from GitHub Actions `.github/workflows/ci.yml`)
  - `Frontend CI Checks` (from GitHub Actions `.github/workflows/ci.yml`)

### 3. Prevent Direct Pushes & Force Pushes
- **Restrict who can push to matching branches**: No direct pushes; all code must go through Pull Requests.
- **Do not allow bypassing the above settings**: Enforce rules on administrators as well.
- **Allow force pushes**: `Disabled` (Never allow force push to `main` or `development`)
- **Allow deletions**: `Disabled`

---

## 🔄 Branching Strategy

```text
feature/xyz  ───► PR into `development` ───► PR into `main` (Production)
```

1. **Feature development**: Always create feature branches branching off `development` (e.g. `feat/auth-system`, `feat/produce-catalogue`).
2. **Review & Merge**: Submit a PR to `development`, ensure CI checks pass, get 1 review approval, then merge.
3. **Release to Main**: Periodically or after milestones, open a PR from `development` into `main`.
