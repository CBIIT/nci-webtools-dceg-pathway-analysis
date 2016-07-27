#!/bin/bash
#
# Description:	This script will replace tokens in the config.ini file with their corresponding actual values
# Usage:	./configure.sh	--mailServer sample.server.com --adminEmails admin@email.com \
#		--debugFlag True|False --port 0000 --folderRoot /local/content/ \
#		--queueURL tcp://queue:9999 --queueName /queue/

# create hash for parameters
declare -A parameters=( [mailServer]= [adminEmails]= [debugFlag]= [folderRoot]= [queueURL]= [queueName]= )
valid=true

# assign arguments to parameters
while true; do
	# if parameter matches --*, then assign its value to the corresponding key
	[[ $1 == --* ]] && parameters[${1:2}]=$2 && shift 2 || break
done

# display any error messages
for key in "${!parameters[@]}"; do
	[ -z "${parameters[$key]}" ] && echo -e "\e[91m[error]\e[39m missing parameter:\e[93m $key \e[39m" && valid=false
done

# replace tokens in config.ini file
if [ $valid = true ]; then

	for key in "${!parameters[@]}"; do
		sed -i "s|\@${key}@|${parameters[$key]}|g" config.ini
	done

	echo -e "\e[92mPathway configured successfully\e[39m"

# display usage if incorrect
else
	echo
	
	echo -e "\e[32mUsage:"
	echo -e "\e[95m	sh\e[39m configure.sh \e[92m[options]"
	
	echo -e "\e[32mOptions:"
	echo -e "\e[39m	--mailServer\e[92m server.name"
	echo -e "\e[39m	--adminEmails\e[92m admin@domain.name"
	echo -e "\e[39m	--debugFlag\e[92m True|False"
	echo -e "\e[39m	--port\e[92m 0-65535"
	echo -e "\e[39m	--folderRoot\e[92m /folder/root"
	echo -e "\e[39m	--queueURL\e[92m tcp://queue/url"
	echo -e "\e[39m	--queueName\e[92m /queue/name \e[39m"
fi
