# Google Cloud

Use when the studio already hosts on Google. Firebase Hosting is the default:
it serves over HTTPS with no further setup. A Cloud Storage bucket is for a
studio that already serves its site from one.

## Log in

`node scripts/check-cli.mjs gcp` runs
`gcloud auth list --filter=status:ACTIVE --format="value(account)"`. For
Firebase, if the `firebase` CLI asks for a sign-in, the developer does that
themselves. Never ask for, print or write a key file.

## Targets

Firebase Hosting separates a preview channel from the live site. Use a preview
channel for development or testing, and the live site only when the developer
asked for production.

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

## Firebase Hosting

```sh
npm install -g firebase-tools
firebase init hosting                          # once; set the public folder to the build output
firebase hosting:channel:deploy <channel-id>   # a preview
firebase deploy --only hosting                 # the live site: only when asked
```

The deploy prints the address. The live site is at `PROJECT_ID.web.app` and
`PROJECT_ID.firebaseapp.com`; a preview channel prints its own address, so read
it from the output.

## Cloud Storage bucket

For a bucket the studio already serves a site from:

```sh
gcloud storage cp -r dist/* gs://<bucket>
```

Only for a new bucket the developer asked you to open to the public:

```sh
gcloud storage buckets add-iam-policy-binding gs://<bucket> --member=allUsers --role=roles/storage.objectViewer
gcloud storage buckets update gs://<bucket> --web-main-page-suffix=index.html --web-error-page=404.html
```

Making a bucket readable by everyone is the developer's decision: put it in the
plan. A custom domain with HTTPS on a bucket needs an external Application Load
Balancer. Say so; do not build one.

## Live address

Read it from the CLI output or take it from the developer. Add its origin to the
Magicweave environment's web addresses (checklist step 7). A custom domain is a
DNS change: only when the developer asks.

## Rollback

Not covered by the sources below. Read Google's own documentation before
promising one.

## Sources

- https://firebase.google.com/docs/hosting/quickstart
- https://docs.cloud.google.com/storage/docs/hosting-static-website
- https://docs.cloud.google.com/sdk/gcloud/reference/auth/list
