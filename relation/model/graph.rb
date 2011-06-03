# -*- coding: utf-8 -*-
require 'sequel'
Sequel::Model.plugin(:schema)

Sequel.connect("sqlite://model/graphs.db")


class Graphs < Sequel::Model
	def self.gyazo(data)
		cmd = %Q[curl -s -F imagedata=@- -F id=kogaidan -H "Expect:" http://gyazo.com/upload.cgi | strings]
		url = IO.popen(cmd, "r+") do |io|
			io.puts(data)
			io.close_write
			io.read
		end
		url
	end
end

