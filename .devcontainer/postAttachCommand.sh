#!/bin/bash
set -e

. $(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/common.sh

# Load all dev environment here
set -o allexport
for f in $(ls .env.development*); do . $f; done
source .env
set +o allexport

mkdir -p log
exec > >(tee -ai log/devcontainer.log)
exec 2>&1

./.devcontainer/script/vault-unseal
./.devcontainer/script/k3s-init

# Remove default first run notice
if [ -f /workspaces/.codespaces/shared/first-run-notice.txt ]; then
  echo "Run the 'Run Build Task' command or press Cmd+Shift+B to start the server." > /workspaces/.codespaces/shared/first-run-notice.txt
fi

# Greet with a login prompt
echo ""
echo "============================================================"
echo "Welcome to the Cased Shell devcontainer"
echo "============================================================"
echo ""
echo "Use the VS Code command palette (Cmd+Shift+P) to start the server:"
echo ""
echo "  > Tasks: Run Build Task"
echo ""
echo "Alternatively, press Cmd+Shift+B to run this task directly."
echo ""
echo "This task will print access instructions."
echo ""
echo "============================================================"
echo ""
echo "Having trouble? Checkout the troubleshooting guide: https://github.com/cased/shell/tree/main/.devcontainer#troubleshooting"

# Tell local-run we're done
touch log/.postAttachCommand.log

echo "" >> log/devcontainer.log
