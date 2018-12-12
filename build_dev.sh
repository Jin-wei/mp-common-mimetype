#!/bin/bash
#This script is used to complete the process of build staging
sudo rm -r node_modules || true
sudo npm install
cp conf_dev.json conf.json
grunt