require 'rubygems'
require 'sinatra'
require 'json/pure'

set :public, File.dirname(__FILE__)

get '/' do
  redirect '/latest'
end

def jpgs(n, after = nil)
  files = []
  Dir::foreach('.') do |f|
    if f =~ /.*\.jpg/ then
      file = File.open(f)
      (files << file) if (after and after < file.ctime.to_i)
      (files << file) unless after
    end
  end
  files.sort do |a, b|
    b.ctime <=> a.ctime
  end[0..n].reverse
end

def faces_and_last_time(jpgs)
  result = Hash.new
  result['faces'] = []
  result['time']  = nil
  jpgs.each do |f|
    result['faces'] << f.path
    result['time'] = f.ctime.to_i
  end
  result
end

get '/latest' do
  redirect '/last/1'
end

get '/last/:n' do
  headers 'Content-Type' => 'application/json', 'Access-Control-Allow-Origin' => '*'
  faces_and_last_time(jpgs(params[:n].to_i - 1)).to_json
end

get '/after/:unixtime' do
  headers 'Content-Type' => 'application/json', 'Access-Control-Allow-Origin' => '*'
  faces_and_last_time(jpgs(-1, params[:unixtime].to_i)).to_json
end

