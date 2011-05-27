ifeq ($(OSTYPE),linux-gnu)
	OPEN=gnome-open
else
	OPEN=open
endif

ifeq ($(OSTYPE),darwin10.0)
	VIEW_TARGET=chaos.svg
else
	VIEW_TARGET=chaos.pdf
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

view:	${VIEW_TARGET}
	${OPEN} $<

clean:
	rm *.pdf *.png

up:	chaos.png
	curl -F imagedata=@./chaos.png -F id=kogaidan -H "Expect:" http://gyazo.com/upload.cgi | strings

