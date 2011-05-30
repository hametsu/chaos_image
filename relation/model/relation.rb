# -*- coding: euc-jp -*-
require 'sequel'
Sequel::Model.plugin(:schema)

Sequel.connect("sqlite://model/relations.db")

class Relations < Sequel::Model
	unless table_exists?
		set_schema do
			primary_key :id
			string :from
			string :to
			text :label
		end
		create_table
	end

	def to_edge
		self.from
		%Q(  "#{self.from}" -> "#{self.to}" [label = "#{self.label}"];)
	end

	def self.to_dot
		result = []
		result << 'digraph Chaos {'
		result << '  graph [concentrate = true];'
		result << '  overlap=orthoxy;'
		Relations.all.each do |relation|
			result << relation.to_edge
		end
		copyright = 'Chaos Lounge Relation Diagram drawn by ARAKAWA Tomonori'
		license   = 'The code of this diagram and itself are distributed under HAMETSU license.'
		url       = 'You can check source code at https://github.com/takano32/chaos_image/tree/master/relation'
		result << %Q[  label = "#{copyright}\\n#{license}\\n#{url}";]
		result << '}'
		result.join("\n")
	end

	require 'base64'
	def self.to_base64png
		cmd= "dot -Tpng"
		data = IO.popen(cmd, "r+") do |io|
			io.puts(self.to_dot)
			io.close_write
			io.read
		end
		Base64.encode64(data)
	end
end


