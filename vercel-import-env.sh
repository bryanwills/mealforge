#!/bin/bash

# Set environment target here: development, preview, or production
ENVIRONMENT="production"

while IFS= read -r line || [ -n "$line" ]; do
  # Skip comments and blank lines
  if [[ "$line" =~ ^#.* ]] || [[ -z "$line" ]]; then
    continue
  fi

  # Split key and value
  IFS='=' read -r key value <<< "$line"

  if [[ -n "$key" && -n "$value" ]]; then
    echo "Adding $key to Vercel ($ENVIRONMENT)"
    echo "$value" | vercel env add "$key" "$ENVIRONMENT"
  fi
done < .env

