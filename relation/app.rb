require 'rubygems'
require 'sinatra'
require 'json'
require 'dm-core'
require 'dm-migrations'
require 'dm-sqlite-adapter'

class User
	include DataMapper::Resource

	property :id, Serial
	property :name, Text
end
configure do
	DataMapper.setup(:default, 'sqlite:db.sqlite3')
	DataMapper.auto_migrate!
end

get '/' do
	'hello, world!'
end

get '/json' do
	{1 => 2}.to_json
end


get '/save' do
	user = User.new
	user.name = 'hoge'
	user.save
	user.name
end

get '/user/:id' do
	user = User.get params[:id].to_i
	user.name
end
