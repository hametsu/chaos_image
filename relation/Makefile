
%.png:	%.dot
	dot $< -Tpng -o $@

%.pdf:	%.pdf
	dot $< -Tpdf -o $@

all:
	dot chaos.dot -Tpng -o chaos.png

pdf:
	dot chaos.dot -Tpdf -o chaos.pdf

view:	chaos.pdf
	open chaos.pdf

up:	chaos.png
	curl -F imagedata=@./chaos.png -F id=kogaidan -H "Expect:" http://gyazo.com/upload.cgi -v

