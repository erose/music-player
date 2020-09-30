ls_output = `aws s3 ls elis-music --recursive`.split("\n")

# Clean the ls output to get just the key names.
keys = ls_output.map { |line|
  example_prefix = "2020-02-25 10:53:14"
  line = line[example_prefix.size..-1].sub(/\s+\d+ /, "")
}

keys.each { |key|
  puts `./add_track_number_to_mp3_path.sh "#{key}"`
}
