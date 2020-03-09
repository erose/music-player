require 'shellwords'

ls_output = `aws s3 ls elis-music --recursive`.split("\n")

# Clean the ls output to get just the key names.
keys = ls_output.map { |line|
  example_prefix = "2020-02-25 10:53:14"
  line = line[example_prefix.size..-1].sub(/\s+\d+ /, "")
}

# Rename.
keys.each { |key|
  prefix = "s3://elis-music/"

  src = "#{prefix}#{key}".shellescape
  new_key = key.sub(%r{/home/eli/\d+/}, '')
  dest = "#{prefix}#{new_key}".shellescape
  next if src == dest

  command = "aws s3 mv #{src} #{dest}"
  system(command)
}
