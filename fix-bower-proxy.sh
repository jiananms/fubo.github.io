#!/bin/bash
set -e

if [ "$http_proxy" != "" ]; then
  if [ "$https_proxy" != "" ]; then
    echo "{\"proxy\":\"$http_proxy\",\"https-proxy\":\"$https_proxy\"}" > ~/.bowerrc || true
  else
    echo "{\"proxy\":\"$http_proxy\",\"https-proxy\":\"$http_proxy\"}" > ~/.bowerrc || true
  fi
fi
