#!/bin/zsh
# set -o allexport
# source .env
# set +o allexport

# https://www.cyberciti.biz/faq/bash-check-if-string-starts-with-character-such-as/

while read line;
do
if [[ $line == "#"* ]] || [[ $line == "" ]] ;
then
    echo "skipping comment or empty line";
else
    echo "writing" $line;
    # heroku config:set GITHUB_USERNAME=joesmith
    heroku config:set $line
fi

done<.env