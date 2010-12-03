require 'rubygems'
require 'sinatra'
require 'json/pure'

get '/' do
  redirect '/latest'
end

def jpgs(n)
  files = []
  Dir::foreach('.') do |f|
    if f =~ /.*\.jpg/ then
      files << File.open(f)
    end
  end
  files.sort do |a, b|
    a.ctime <=> b.ctime
  end[0...n]
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
  faces_and_last_time(jpgs(params[:n].to_i)).to_json
end

=begin
    {
      "faces" : [
        "http://192.168.1.3:8000/1111111.jpg"],
      time : 111111111111
    }
    {
      "faces" : [
        "http://192.168.1.3:8000/1111111.jpg",
        "http://192.168.1.3:8000/2222222.jpg",
        "http://192.168.1.3:8000/3333333.jpg"
      ],
      time : 111111111111
    }
=end



