#!/bin/bash

for filename in *.mp3; do
  s3name=s3://elis-music/$(ruby -e "puts ARGV[0].gsub('#', '/')" "$filename")
  aws s3 mv "$filename" "$s3name"
done