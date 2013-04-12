# -*- coding: utf-8 -*-
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
		from = self.from
		to = self.to
		label = self.label

		if from.empty? and to.empty? then
			""
		elsif from.empty? or to.empty? then
			%Q(  "#{self.from + self.to}";)
		else
			unless label.empty? then
				%Q(  "#{self.from}" -> "#{self.to}" [label = "#{self.label}"];)
			else
				%Q(  "#{self.from}" -> "#{self.to}";)
			end
		end
	end

	def to_s
		unless self.label.empty? then
			"#{self.from} =====(#{self.label})=====> #{self.to}"
		else
			"#{self.from} ==========> #{self.to}"
		end
	end

	def self.to_dot
		result = []
		result << 'digraph Chaos {'
		result << '  graph [concentrate = true];'
		result << '  overlap=orthoxy;'
		Relations.all.each do |relation|
			result << relation.to_edge
		end
		copyright = 'Relation Diagram drawn by ARAKAWA Tomonori'
		license   = 'The code of this diagram and itself are distributed under HAMETSU license.'
		url       = 'You can check source code at https://github.com/takano32/chaos_image/tree/master/relation'
		_ = %Q[  label = "\\n\\n#{copyright}\\n#{license}\\n#{url}";]

		result << '}'
		result.join("\n")
	end

	def self.to_png
		cmd= "dot -Tpng"
		data = IO.popen(cmd, "r+") do |io|
			io.puts(self.to_dot)
			io.close_write
			io.read
		end
		data
	end
end


