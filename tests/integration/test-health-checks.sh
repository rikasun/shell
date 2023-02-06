#!/bin/bash
set -e -o pipefail

# Ensure certificate generation hasn't happened yet
! grep tls.on_demand /tmp/log

# Ensure health checks work
[ -n "$GIT_SHA" ]
: ${PORT:=8088}
curl -0        --fail -s --max-time 1 "127.0.0.1:${PORT}/_health" | grep "ok $GIT_SHA"
curl --http1.1 --fail -s --max-time 1 "127.0.0.1:${PORT}/_health" | grep "ok $GIT_SHA"
curl --http2   --fail -s --max-time 1 "127.0.0.1:${PORT}/_health" | grep "ok $GIT_SHA"

# Ensure certificate generation hasn't happened yet
! grep tls.on_demand /tmp/log
