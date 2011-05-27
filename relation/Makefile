ifeq ($(OSTYPE),linux-gnu)
	OPEN=gnome-open
else
	OPEN=open
endif

%.png:	%.dot
	dot $< -Tpng -o $@

%.pdf:	%.dot
	dot $< -Tpdf -o $@

%.svg:	%.dot
	dot $< -Tsvg -o $@

default:	view

pdf:
	dot chaos.dot -Tpdf -o chaos.pdf

view:	chaos.pdf
	${OPEN} chaos.pdf

clean:
	rm *.pdf *.png

up:	chaos.png
	curl -F imagedata=@./chaos.png -F id=kogaidan -H "Expect:" http://gyazo.com/upload.cgi | strings

