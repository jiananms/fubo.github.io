#!/bin/bash
# References:
# https://medium.com/@nthgergo/publishing-gh-pages-with-travis-ci-53a8270e87db
# https://gist.github.com/domenic/ec8b0fc8ab45f39403dd

# exit with nonzero exit code if anything fails
set -e

# check tag
if [ "$TRAVIS_TAG" = "" ]; then
   echo "Not a tag, skip deploying"
   exit 0
else
   echo "==> Building and deploying tag $TRAVIS_TAG <=="
fi

# check GH_TOKEN
if [ "$GH_TOKEN" = "" ]; then
   echo "GH_TOKEN is not set, skip deploying"
   exit 0
fi

# check GH_REF
if [ "$GH_REF" = "" ]; then
   echo "GH_REF is not set, skip deploying"
   exit 0
fi

# go to the build directory and create a *new* Git repo
cd build
git init

# inside this git repo we'll pretend to be a new user
git config user.name "Token"
git config user.email "token@wutnews.net"

cp welcome.html index.html

# The first and only commit to this new Git repo contains all the
# files present with the commit message "Deploy to GitHub Pages".
git add .
git commit -m "Deployed to Github Pages"

# Force push from the current repo's master branch to the remote
# repo's gh-pages branch. (All previous history on the gh-pages branch
# will be lost, since we are overwriting it.) We redirect any output to
# /dev/null to hide any sensitive credential data that might otherwise be exposed.
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
