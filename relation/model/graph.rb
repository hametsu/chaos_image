# -*- coding: utf-8 -*-
require 'sequel'
Sequel::Model.plugin(:schema)

Sequel.connect("sqlite://model/graphs.db")

class Graphs < Sequel::Model
end

