# AWS

Use when the studio already hosts on AWS. This skill syncs the build into the
studio's existing S3 bucket and invalidates their existing CloudFront
distribution. It does not create buckets, distributions or certificates.

## Log in

`node scripts/check-cli.mjs aws` runs `aws sts get-caller-identity`, which needs
no permissions and prints the account. If it fails, the developer configures
their own AWS credentials. Never ask for, print or write an access key.

## Targets

Ask the developer which bucket and distribution serve which Magicweave
environment. Use the one for development or testing unless they asked for
production. If they have only a production bucket, say so and stop; do not
deploy a test build into it.

## Build with the variables set

Variables are compiled in at build time, so build locally. Replace the build
command with the one `scripts/detect-build.mjs` printed:

```sh
VITE_MW_BASE_URL="$(grep '^MW_BASE_URL=' .env | cut -d= -f2-)" \
VITE_MW_CLIENT_ID="$(grep '^MW_CLIENT_ID=' .env | cut -d= -f2-)" \
VITE_MW_CLIENT_SECRET="$(grep '^MW_CLIENT_SECRET=' .env | cut -d= -f2-)" \
pnpm run build
```

Use `EXPO_PUBLIC_MW_*` names for an Expo web build.

## Deploy

```sh
aws s3 sync dist s3://<bucket> --dryrun
aws s3 sync dist s3://<bucket>
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```

Replace `dist` with the output folder. Run `--dryrun` first and show the
developer what it would change. `--delete` also removes bucket objects that are
not in the build: add it only if the developer asks and the dry run shows only
files they expect to lose.

## Live address

The developer's own CloudFront domain or custom domain, which they tell you.
Do not guess it. Add its origin to the Magicweave environment's web addresses
(checklist step 7). A new domain or certificate is a DNS change: only when the
developer asks.

## Rollback

Not covered by the sources below. Read AWS's own documentation before promising
one.

## Sources

- https://docs.aws.amazon.com/cli/latest/reference/sts/get-caller-identity.html
- https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html
- https://docs.aws.amazon.com/cli/latest/reference/cloudfront/create-invalidation.html
