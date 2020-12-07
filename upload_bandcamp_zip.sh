#!/bin/bash
set -e

unzip "$1"
rename 's/ \- /#/g' *.mp3
./upload_music.sh *.mp3
rm "$1"
rm -f 'cover.jpg'
rm -f 'cover.png'
