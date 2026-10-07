# GitHub Pages

Use when the game's repository is on GitHub and the build is static. A GitHub
Actions workflow builds the game and publishes it. The build variables are
environment variables on the `github-pages` environment.

## Log in

`node scripts/check-cli.mjs github` runs `gh auth status`, which exits 1 when
not signed in. The developer signs in to `gh` themselves. Never write a token
into the repository or the workflow.

## Targets

A repository has one Pages site, so it serves one Magicweave environment.
Use a development or testing environment unless the developer asked for
production, and use that environment's key in the variables below.

## Enable the Actions source first

Custom workflows must be enabled for the repository before they are used: set
the site's publishing source to GitHub Actions, in the steps on the page
"Configuring a publishing source for your GitHub Pages site" (linked from the
first Sources page). Do this before the variables below, which are set on the
`github-pages` environment; if `gh` reports that environment missing, this step
is not done.

## Set the build variables

Variables, not secrets: a workflow reads them as `${{ vars.NAME }}`. A client key ships in the
public build anyway. Read the values from `.env` without echoing them:

```sh
grep '^MW_BASE_URL=' .env | cut -d= -f2- | gh variable set VITE_MW_BASE_URL --env github-pages
grep '^MW_CLIENT_ID=' .env | cut -d= -f2- | gh variable set VITE_MW_CLIENT_ID --env github-pages
grep '^MW_CLIENT_SECRET=' .env | cut -d= -f2- | gh variable set VITE_MW_CLIENT_SECRET --env github-pages
```

Add `--repo OWNER/REPO` outside the repository's folder. Use `EXPO_PUBLIC_MW_*`
names for an Expo web build.

## The workflow

Write `.github/workflows/pages.yml`. Copy the repository's existing checkout,
install and build steps into the marked place (or follow the vendor's page in
Sources if it has none), and use the build command and output folder from
`scripts/detect-build.mjs`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      # checkout, install and build, from the repository's own CI; the build
      # step carries this env block:
      #   env:
      #     VITE_MW_BASE_URL: ${{ vars.VITE_MW_BASE_URL }}
      #     VITE_MW_CLIENT_ID: ${{ vars.VITE_MW_CLIENT_ID }}
      #     VITE_MW_CLIENT_SECRET: ${{ vars.VITE_MW_CLIENT_SECRET }}
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v4
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

Replace `path` with the output folder. The developer reviews the file and
pushes it themselves; the workflow runs on their push to `main`.

## Live address

The workflow's `page_url` output (shown on the run and the environment). The
site is `<owner>.github.io` or `<owner>.github.io/<repositoryname>`. A project
site is served from a sub-path, so confirm the game's assets load there. The
Magicweave web address is the origin only, `https://<owner>.github.io`, which is
shared by every site that owner publishes.

## Rollback

Not covered by the sources below. Read GitHub's own documentation before
promising one.

## Sources

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://cli.github.com/manual/gh_variable_set
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-variables
- https://cli.github.com/manual/gh_auth_status
