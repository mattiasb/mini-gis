#!/bin/bash

BROWSER="google-chrome --app="

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
${BROWSER}"file://${DIR}/client/index.html"
