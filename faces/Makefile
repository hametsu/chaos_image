CPPFLAGS=-I/opt/local/include/opencv -I/opt/local/include -I/usr/include/opencv
LDFLAGS=-L/opt/local/lib -lcxcore -lhighgui -lcv
LDFLAGS=-L/opt/local/lib -lopencv_core -lopencv_highgui -lopencv_imgproc -lopencv_video -lopencv_objdetect
all:	warai
run:	warai
	#./warai --cascade=haarcascade_frontalface_alt2.xml 0
	while : ; do ./warai ; done
clean:
	rm warai

