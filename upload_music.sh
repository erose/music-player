#!/bin/bash

for filename in "$@"; do
  echo "Uploading $filename..."
  s3name=s3://elis-music/$(ruby -e "puts ARGV[0].gsub('#', '/')" "$filename")
  aws s3 mv "$filename" "$s3name"
done
