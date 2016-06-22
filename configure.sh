#!/bin/bash

# Description: Configures this application by populating the config.ini file
# Usage	:	./configure.sh	--mailServer sample.server.com --adminEmails admin@email.com \
#			--debugFlag True|False --port 0000 --folderRoot /local/content/ \
#			--queueURL tcp://queue:9999 --queueName /queue/

# Create hash for parameters
declare -A parameters=( [mailServer]= [adminEmails]= [debugFlag]= [port]= [folderRoot]= [queueURL]= [queueName]= )
valid=true

# assign arguments to parameters
while true; do
	# if parameter matches --*, then assign its value to the corresponding key
	[[ $1 == --* ]] && parameters[${1:2}]="$2"; shift 2 || break
done

# display any error messages
for key in "${!parameters[@]}"; do
	[ -z "${parameters[$key]}" ] && echo -e "\e[91m[error]\e[39m missing parameter:\e[93m $key \e[39m" && valid=false
done

# replace tokens in config.ini file
if [ $valid = true ]; then

	for key in "${!parameters[@]}"; do
		sed -e "s|\@${key}@|${parameters[$key]}|" config.ini > config.tmp && mv config.tmp config.ini
	done

	echo -e "\e[92mPathway configured successfully\e[39m"
fi
