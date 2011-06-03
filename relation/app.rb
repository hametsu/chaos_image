# -*- coding: utf-8 -*-
require 'rubygems'
require 'sinatra'
require 'sinatra/reloader'
require 'model/relation'
require 'haml'

helpers do
	include Rack::Utils; alias_method :h, :escape_html
end

configure do
end

get '/' do
	@relations = Relations.all
	haml :index
end

put '/new' do
	parameter = {
		:from  => request[:from],
		:to    => request[:to],
		:label => request[:label],
	}
	Relations.create(parameter)
	redirect '/'
end

put '/delete' do
	ids = request[:relation]
	ids.each do |id|
		r = Relations.find(:id => id)
		r.delete
	end
	redirect '/'
end

get '/relation/:id' do
	relation = Relations.get params[:id].to_i
	relation.to_edge
end
