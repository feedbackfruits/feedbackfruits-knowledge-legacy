#!/bin/bash

# Write ~/.netrc
cat > ~/.netrc << EOF
machine api.heroku.com
  login $HEROKU_LOGIN
  password $HEROKU_API_TOKEN
machine git.heroku.com
  login $HEROKU_LOGIN
  password $HEROKU_API_TOKEN
EOF

# Add heroku.com to the list of known hosts
ssh-keyscan -H heroku.com >> ~/.ssh/known_hosts
