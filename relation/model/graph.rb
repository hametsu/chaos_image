# -*- coding: utf-8 -*-
require 'sequel'
Sequel::Model.plugin(:schema)

Sequel.connect("sqlite://model/graphs.db")

require 'model/relation'

class Graphs < Sequel::Model
	def self.gyazo(data)
		png = Relations.to_png
		cmd = %Q[curl -s -F imagedata=@- -F id=kogaidan -H "Expect:" http://gyazo.com/upload.cgi | strings]
		data = IO.popen(cmd, "r+") do |io|
			io.puts(png)
			io.close_write
			io.read
		end
		url = data
	end
end

