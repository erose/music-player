#!/bin/bash
set -e

path="$1"

local_path="${path//[\/]/#}"
local_path="${local_path//[\']/\\\'}" # escape single quotes
aws s3 cp "s3://elis-music/$path" "$local_path"
track_num=$(python -c "import eyed3; import sys; track_num = eyed3.load(sys.argv[1]).tag.track_num[0]; print('' if track_num is None else str(track_num).zfill(2))" "$local_path")

new_local_path=$(python -c "import sys; splits = '$local_path'.split('#'); prefix, last = splits[:-1], splits[-1]; last = '$track_num - ' + last if not last.startswith('$track_num') else last; print('#'.join(prefix) + '#' + last)")
new_path="${new_local_path//[#]/\/}"

if [ "$path" != "$new_path" ]; then
  aws s3 mv "s3://elis-music/$path" "s3://elis-music/$new_path"
fi
rm "$local_path"
