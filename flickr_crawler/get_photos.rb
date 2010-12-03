require 'rubygems'
require 'open-uri'
require 'nokogiri'
require 'json/pure'

def save_file(url, photo_id, size)
  filename = "photos/#{photo_id}_#{size}.jpg"
  open(filename, 'wb') do |file|
    file.puts Net::HTTP.get_response(URI.parse(url)).body
  end
end

def flickr(method)
  flickr_key = 'ed699ee8139802047e25865512d99b6a'
  endpoint = "http://api.flickr.com/services/rest/?api_key=#{flickr_key}&#{method}"
end

photos = JSON.load(open('json.dat'))
photos.each_pair do |photo_id, body|
	p photo_id
	photo_info = flickr("method=flickr.Photos.getInfo&photo_id=#{photo_id}")
	doc = Nokogiri::XML(open(photo_info).read())
	doc.xpath('//photo').each do|photo|
		farm = photo.attributes['farm'].value
		server = photo.attributes['server'].value
		id = photo.attributes['id'].value
		begin
		  originalsecret = photo.attributes['originalsecret'].value
		  photo_url_o = "http://farm#{farm}.static.flickr.com/#{server}/#{id}_#{originalsecret}_o.jpg"
		  save_file(photo_url_o, photo_id, 'o')
		rescue Exception => e
		  p e
		end
		begin
		  secret = photo.attributes['secret'].value
		  photo_url_b = "http://farm#{farm}.static.flickr.com/#{server}/#{id}_#{secret}_b.jpg"
		  save_file(photo_url_b, photo_id, 'b')
		rescue Exception => e
		  p e
		end
	end
end


