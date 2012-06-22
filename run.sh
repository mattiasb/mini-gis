#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
google-chrome "--app=file://${DIR}/client/index.html"
