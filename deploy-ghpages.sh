#!/bin/bash
# References:
# https://medium.com/@nthgergo/publishing-gh-pages-with-travis-ci-53a8270e87db
# https://gist.github.com/domenic/ec8b0fc8ab45f39403dd

# exit with nonzero exit code if anything fails
set -e

# go to the build directory and create a *new* Git repo
cd dist
if [ -d ".git" ]; then
  rm -rf .git
fi
git init

# inside this git repo we'll pretend to be a new user
git config user.name "Token"
git config user.email "token@wutnews.net"

# The first and only commit to this new Git repo contains all the
# files present with the commit message "Deploy to GitHub Pages".
git add .
git commit -m "Deployed to Github Pages"

# Force push from the current repo's master branch to the remote
# repo's gh-pages branch. (All previous history on the gh-pages branch
# will be lost, since we are overwriting it.) We redirect any output to
# /dev/null to hide any sensitive credential data that might otherwise be exposed.
git push --force "https://gwc0721:xsszxgGWC0721@github.wutnews.net/gwc0721/joinus-mobile-2016.git" master:gh-pages

cd ..
