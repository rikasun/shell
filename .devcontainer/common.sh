# Output the name of a devcontainer, handling the difference in separator
# between Docker Compose v1 and v2 on the host.
# Amusingly, Docker Compose v1 is running inside the container, so we need to
# use the name of the created containers to infer what version they were created
# with.
function devcontainer_name() {
  devcontainer_separator="_"
  if docker ps -a 2>/dev/null | grep -q -- -app-1; then
    devcontainer_separator="-"
  else
    :
  fi
  printf "${NAME_WITHOUT_OWNER:-shell}_devcontainer${devcontainer_separator}${1}${devcontainer_separator}1"
}

function waitForPort() {
    if ! nc -z localhost $1; then
    printf "Waiting for localhost:$1 to be ready..."
    until nc -z localhost $1; do
      printf "."
      sleep 1
    done
    echo "ready!"
  fi
}
