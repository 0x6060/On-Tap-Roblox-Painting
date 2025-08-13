local lzw = require("lzw")
local basex = require("basex")
local base91 = basex.DISCORD

local inputpath = arg[1]
local outputpath = arg[2]

if not inputpath or not outputpath then
  os.exit(1)
end

local file = assert(io.open(inputpath, "rb"))
local input = file:read("*all")
file:close()
local compressed, _ = lzw.compress(input)
if not compressed then
  os.exit(1)
end

local encoded = base91:encode(compressed)
local output = assert(io.open(outputpath, "wb"))
output:write(encoded)
output:close()
