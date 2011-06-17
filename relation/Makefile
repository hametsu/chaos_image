TARGET=mad

ifeq ($(OSTYPE),linux-gnu)
	OPEN=gnome-open
else
	OPEN=open
endif

ifeq ($(OSTYPE),darwin10.0)
	VIEW_TARGET=${TARGET}.svg
else
	VIEW_TARGET=${TARGET}.pdf
endif


%.png:	%.dot
	dot $< -Tpng -o $@

%.pdf:	%.dot
	dot $< -Tpdf -o $@

%.svg:	%.dot
	dot $< -Tsvg -o $@

default:	view

pdf:
	dot ${TARGET}.dot -Tpdf -o ${TARGET}.pdf

view:	${VIEW_TARGET}
	${OPEN} $<

clean:
	rm *.pdf *.png

up:	${TARGET}.png
	curl -F imagedata=@./${TARGET}.png -F id=kogaidan -H "Expect:" http://gyazo.com/upload.cgi | strings

web:
	ruby app.rb

