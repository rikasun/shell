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

# Remove any previous markers of completion.
rm -f log/.postAttachCommand.log

# Remove default first run notice
if [ -f /workspaces/.codespaces/shared/first-run-notice.txt ]; then
  echo "Setup still in progress. Run the 'Run Build Task' command or press Cmd+Shift+B to follow along." > /workspaces/.codespaces/shared/first-run-notice.txt
fi

./.devcontainer/script/k3s-init

mkdir -p tmp
touch tmp/authorized_keys

python ./seed.py

# Append cased shell authorized key
cat tmp/authorized_keys
echo >> tmp/authorized_keys
cat /tmp/authorized_keys >> tmp/authorized_keys

# TODO bring back support for v1 keys if testing requires it
for container in $(devcontainer_name sshd2) $(devcontainer_name sshd3); do
  docker cp tmp/authorized_keys $container:/home/app/.ssh/authorized_keys
  docker exec $container chown app:app /home/app/.ssh/authorized_keys
  docker exec $container chmod 600 /home/app/.ssh/authorized_keys
done
