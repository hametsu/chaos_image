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
		%Q(#{self.from} -> #{self.to} [label = "#{self.label}"];)
	end
end


