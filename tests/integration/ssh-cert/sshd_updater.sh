#!/bin/bash

# - This script monitors the directory $MANIFEST_DIR, each time
# a $MANIFEST_FILE is found within it the script updates /etc/sshd_config
# and restart the ssh server.
#
# The manifest file contain options to be added to the ssh server configuration
# file along with files that must be copied to the /etc/ssh dir.
#
# - Following is the manifest file structure:
# [options]
# Option 1
# ...
# [files]
# File1
# ...
#
# - Example manifest file:
# [options]
# PermitRootLogin yes
# [files]
# host_key.pub
#
# Each options' text found is appended to the sshd configuration file.
# Each file found is copied to /etc/ssh/ dir.
# When processing of the manifest file is done the ssh server is restarted.

set -e

MANIFEST_DIR="/sshd_update"
MANIFEST_FILE="manifest.txt"

# Enumeration for manifest file sections.
MF_UNKNOWN=0
MF_OPTIONS=1
MF_FILES=2

curr_section=$MF_UNKNOWN

chmod a+wx "${MANIFEST_DIR}"
cd "${MANIFEST_DIR}"

log() { cat <<< "[*] sshd_updater: $@"; }

log "Waiting for manifest file..."


ln=1

while true; do
	if [ ! -f "$MANIFEST_FILE" ]; then
		sleep 1
		continue
	fi

	log "Manifest file found, updating configuration..."

	cat "$MANIFEST_FILE" | while read line; do
		# Skip empty lines
		if [ -z "$line" ]; then
			log "$ln Empty line, skip"
			continue
		fi

		if [ "$line" = "[options]" ]; then
			log "$ln [options] section"
			curr_section=$MF_OPTIONS
		elif [ "$line" = "[files]" ]; then
			log "$ln [files] section"
			curr_section=$MF_FILES
		else
			if [ $curr_section -eq $MF_UNKNOWN ]; then
				log "$ln Invalid manifest file"
				exit 1
			fi

			if [ $curr_section -eq $MF_OPTIONS ]; then
				log "$ln Adding configuration: ${line}"
				echo "$line" >> /etc/ssh/sshd_config
			else
				log "$ln Copying file: ${line}"
				cp -f "$line" /etc/ssh
			fi
		fi

		let ln+=1
	done

	rm -f "$MANIFEST_FILE"

	log "Restarting ssh server..."
	rc-service sshd restart
	log "Done"
done
