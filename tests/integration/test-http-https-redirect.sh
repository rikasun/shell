#!/bin/bash
set -e -o pipefail

# Ensure http->https redirects work
: ${PORT:=8088}
curl -0        -v --max-time 1 "localhost:${PORT}/" 2>&1 | grep " 308 "
curl --http1.1 -v --max-time 1 "localhost:${PORT}/" 2>&1 | grep " 308 "
curl --http2   -v --max-time 1 "localhost:${PORT}/" 2>&1 | grep " 308 "

# Ensure certificate generation hasn't happened yet
! grep tls.on_demand /tmp/log
