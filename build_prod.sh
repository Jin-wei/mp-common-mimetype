#!/bin/bash
#This script is used to complete the process of build staging

rm which_version || true
git log -1 --format="%H" >> which_version
sudo rm -r node_modules || true
sudo npm install
cp conf_prod.json conf.json
grunt