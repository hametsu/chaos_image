require 'rubygems'
require 'open-uri'
require 'nokogiri'
require 'pstore'
require 'json/pure'

# データは片っ端からJSONに保存していく
class JsonStore < PStore
  def initialize(file); super(file); end
  def dump(table); table.to_json; end
  def load(content); JSON.load(content); end
end
db = JsonStore.new('json.dat')

# Flickrを使って人物の写った写真をガンガン保存する
def flickr(method)
  flickr_key = 'ed699ee8139802047e25865512d99b6a'
  endpoint = "http://api.flickr.com/services/rest/?api_key=#{flickr_key}&#{method}"
end

user_id = '90041784%40N00' # yuiseki
person_photo = flickr("method=flickr.people.getPhotosOf&user_id=#{user_id}&per_page=100")
doc = Nokogiri::XML(open(person_photo).read())
doc.xpath('//photo').each do|photo|
  db.transaction do |db|
    p 'photo id:'+photo_id = photo.attributes['id'].value
	unless false #db[photo_id]
	  photo = db[photo_id] = Hash.new
	  people_list = flickr("method=flickr.photos.people.getList&photo_id=#{photo_id}")
	  ph = Nokogiri::XML(open(people_list).read())

	  photo['people'] = Hash.new
	  ph.xpath('//people/person').each do|pa|
		photo['people'][pa.attributes['username'].value] = Hash.new
		person = photo['people'][pa.attributes['username'].value]
		person['realname'] = pa.attributes['realname'].value
		person['nsid'] = pa.attributes['nsid'].value
		if pa.attributes['w']
		  person['w'] = pa.attributes['w'].value
		  person['h'] = pa.attributes['h'].value
		  person['x'] = pa.attributes['x'].value
		  person['y'] = pa.attributes['y'].value
		end
	  end


	else
	  p 'データ保存済み'
	end
  end

end



