#include "cv.h"
#include "highgui.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <math.h>
#include <float.h>
#include <limits.h>
#include <time.h>
#include <ctype.h>

#ifdef _EiC
#define WIN32
#endif

static CvMemStorage* storage = 0;
static CvHaarClassifierCascade* cascade = 0;
int angle = 0;
int hist_size = 256;
IplImage *filter_image;

CvSeq* detect_face(IplImage* img);
void draw_warai(IplImage* img, CvSeq* faces);
int detect_same_face( IplImage* img, IplImage* img_old, CvRect facearea );
double hist_filter(IplImage* src1, IplImage* src2);

const char* cascade_name =
	"haarcascade_frontalface_alt.xml";
/*    "haarcascade_profileface.xml";*/

int main( int argc, char** argv )
{
	CvCapture* capture = 0;
	IplImage *frame, *frame_copy = 0;
    IplImage *frame_old = 0;
	int optlen = strlen("--cascade=");
	const char* input_name;
	CvSeq* faces;

	//loading image for filter
	filter_image = cvLoadImage("filter.jpg", 1);

	if( argc > 1 && strncmp( argv[1], "--cascade=", optlen ) == 0 )
		{
			cascade_name = argv[1] + optlen;
			input_name = argc > 2 ? argv[2] : 0;
		}
	else
		{
			cascade_name = "./haarcascade_frontalface_alt2.xml";
			input_name = argc > 1 ? argv[1] : 0;
		}

	cascade = (CvHaarClassifierCascade*)cvLoad( cascade_name, 0, 0, 0 );
    
	if( !cascade )
		{
			fprintf( stderr, "ERROR: Could not load classifier cascade\n" );
			fprintf( stderr,
						"Usage: facedetect --cascade=\"<cascade_path>\" [filename|camera_index]\n" );
			return -1;
		}
	storage = cvCreateMemStorage(0);
    
	if( !input_name || (isdigit(input_name[0]) && input_name[1] == '\0') )
		capture = cvCaptureFromCAM( !input_name ? 0 : input_name[0] - '0' );
	else
		capture = cvCaptureFromAVI( input_name ); 

    frame = cvQueryFrame( capture );
    frame_old = cvCreateImage( cvSize(frame->width,frame->height),
                                                             IPL_DEPTH_8U, frame->nChannels );
	cvNamedWindow( "result", 1 );

	if( capture )
		{
			for(;;)
				{
                    cvCopy( frame, frame_old, 0 );
					frame = cvQueryFrame( capture );
					if( !frame )
						break;
					if( !frame_copy )
						frame_copy = cvCreateImage( cvSize(frame->width,frame->height),
															 IPL_DEPTH_8U, frame->nChannels );
					if( frame->origin == IPL_ORIGIN_TL )
						cvCopy( frame, frame_copy, 0 );
					else
						cvFlip( frame, frame_copy, 0 );
            
					faces = detect_face( frame_copy );
					draw_warai(frame_copy, faces);

					if( cvWaitKey( 10 ) >= 0 )
						break;
				}

			cvReleaseImage( &frame_copy );
			cvReleaseCapture( &capture );
		}
	else
		{
			const char* filename = input_name ? input_name : (char*)"lena.jpg";
			IplImage* image = cvLoadImage( filename, 1 );

			if( image )
				{
					faces = detect_face( image );
					draw_warai(image, faces);
					cvWaitKey(0);
					cvReleaseImage( &image );
				}
			else
				{
					/* assume it is a text file containing the
						list of the image filenames to be processed - one per line */
					FILE* f = fopen( filename, "rt" );
					if( f )
						{
							char buf[1000+1];
							while( fgets( buf, 1000, f ) )
								{
									int len = (int)strlen(buf);
									while( len > 0 && isspace(buf[len-1]) )
										len--;
									buf[len] = '\0';
									image = cvLoadImage( buf, 1 );
									if( image )
										{
											faces = detect_face( image );
											draw_warai(image, faces);
											cvWaitKey(0);
											cvReleaseImage( &image );
										}
								}
							fclose(f);
						}
				}

		}
    
	cvDestroyWindow("result");

	return 0;
}

CvSeq* detect_face(IplImage* img)
{
	static CvScalar colors[] = 
		{
			{{0,0,255}},
			{{0,128,255}},
			{{0,255,255}},
			{{0,255,0}},
			{{255,128,0}},
			{{255,255,0}},
			{{255,0,0}},
			{{255,0,255}}
		};

	double scale = 1.0;
	IplImage* gray = cvCreateImage( cvSize(img->width,img->height), 8, 1 );
	IplImage* small_img = cvCreateImage( cvSize( cvRound (img->width/scale),
																cvRound (img->height/scale)),
																	 8, 1 );
	cvCvtColor( img, gray, CV_BGR2GRAY );
	cvResize( gray, small_img, CV_INTER_LINEAR );
	cvEqualizeHist( small_img, small_img );
	cvClearMemStorage( storage );

	if( cascade )
	{
		double t = (double)cvGetTickCount();
		CvSeq* faces = cvHaarDetectObjects( small_img, cascade, storage,
															1.1, 2, 0/*CV_HAAR_DO_CANNY_PRUNING*/,
															cvSize(100, 100) );
		t = (double)cvGetTickCount() - t;
		printf( "detection time = %gms\n", t/((double)cvGetTickFrequency()*1000.) );
		cvReleaseImage( &gray );
		cvReleaseImage( &small_img );
		return faces;
		cvReleaseImage( &filter_image );
	}
}

void draw_warai(IplImage* img, CvSeq* faces)
{
	int i;
	static int count = 0;
	double scale = 1.0;
	IplImage* warai = NULL;
	IplImage* resized = cvCreateImage(cvSize(128, 128), IPL_DEPTH_8U, 3);
	//warai = cvLoadImage("warai.png", CV_LOAD_IMAGE_ANYCOLOR);

	angle += 30;
	
	for( i = 0; i < (faces ? faces->total : 0); i++ )
	{
		IplImage* warai_scale = NULL;
		CvMat* rotmat;
		CvRect* r = (CvRect*)cvGetSeqElem( faces, i );
		CvRect roi = cvRect(0, 0, 0, 0);
		roi.x = cvRound(r->x * scale);
		roi.y = cvRound(r->y * scale);
		roi.width = cvRound(r->width * scale);
		roi.height = cvRound(r->height * scale);

		warai_scale = cvCreateImage(cvSize(roi.width, roi.height), IPL_DEPTH_8U, 3);
		rotmat = cvCreateMat(2, 3, CV_32FC1);
		cv2DRotationMatrix(cvPoint2D32f(roi.height/2, roi.width/2), angle, 1, rotmat);
		//cvResize(warai, warai_scale, CV_INTER_CUBIC);

		cvSetImageROI(img, roi);
		cvWarpAffine(img, warai_scale, rotmat, 0, cvScalarAll(0));

		//filter
		if (count % 12 == 0) {
			char filename[256];
			sprintf(filename, "./images/face%02d_%ld.jpg", i, time(NULL));
			cvResize(img, resized, CV_INTER_CUBIC);
			if(hist_filter(filter_image, resized) < 0.0)
			{
				cvSaveImage(filename, resized, 0);
			}
			else
			{
				printf("filtered\n");
			}
		}
		cvCopy(warai_scale, img, NULL);
		cvResetImageROI(img);
		cvReleaseImage(&warai_scale);
	}
	cvReleaseImage(&warai);
	cvReleaseImage(&resized);

	cvShowImage( "result", img );
	count++;
}

int detect_same_face( IplImage* img, IplImage* img_old, CvRect facearea ) {
	int i, j, dx, dy;
	int block_size = 10;
	int shift_size = 10;
	CvSize face_size = cvSize(facearea.width, facearea.height);
	IplImage *img_gray = cvCreateImage(face_size, IPL_DEPTH_8U, 1);
	IplImage *img_gray_old = cvCreateImage(face_size, IPL_DEPTH_8U, 1);
	CvMat *velx, *vely;
	CvSize block = cvSize(block_size, block_size);
	CvSize shift = cvSize(shift_size, shift_size);
	CvSize max_range = cvSize(50, 50);
	int cols = floor((facearea.width - block.width) / shift.width);
	int rows = floor((facearea.width - block.height) / shift.height);
	velx = cvCreateMat(rows, cols, CV_32FC1);
	vely = cvCreateMat(rows, cols, CV_32FC1);
	cvSetZero(velx);
	cvSetZero(vely);

	cvCvtColor(img, img_gray, CV_BGR2GRAY);
	cvCvtColor(img_old, img_gray_old, CV_BGR2GRAY);
	cvCalcOpticalFlowBM(img_gray_old, img_gray, block, shift, max_range, 0, velx, vely);

	dx = 0;
	dy = 0;
	for (i = 0; i < velx->cols; i++) {
		for (j = 0; j < vely->rows; j++) {
			dx += (int)cvGetReal2D(velx, j, i);
			dy += (int)cvGetReal2D(vely, j, i);
		}
	}
	dx /= i*j;
	dy /= i*j;
	printf("%d %d %d\n", dx, dy, i*j);
	return 0;
}

double hist_filter(IplImage* src1, IplImage* src2)
{
	IplImage *dst1[4] = {0, 0, 0, 0}, *dst2[4] = {0, 0, 0, 0};
	CvHistogram *hist1, *hist2;
	int sch1 = 0, sch2 = 0;
	int hist_size = 256;
	float range_0[] = { 0, 256 };
	float *ranges[] = { range_0 };
	int i;

	sch1 = src1->nChannels;
	sch2 = src2->nChannels;
	if(sch1 != sch2){
		return -1;
	}

	for(i=0;i<sch1;i++) {
		dst1[i] = cvCreateImage (cvSize (src1->width, src1->height), src1->depth, 1);
		dst2[i] = cvCreateImage (cvSize (src2->width, src2->height), src2->depth, 1);
	}

	hist1 = cvCreateHist (1, &hist_size, CV_HIST_ARRAY, ranges, 1);
	hist2 = cvCreateHist (1, &hist_size, CV_HIST_ARRAY, ranges, 1);

	if (sch1 == 1) {
		cvCopy (src1, dst1[0], NULL);
		cvCopy (src2, dst2[0], NULL);
	}else{
		cvSplit (src1, dst1[0], dst1[1], dst1[2], dst1[3]);
		cvSplit (src2, dst2[0], dst2[1], dst2[2], dst2[3]);
	}

	for(i= 0;i<sch1;i++){
		cvCalcHist (&dst1[i], hist1, 0, NULL);
		cvCalcHist (&dst2[i], hist2, 0, NULL);
		cvNormalizeHist(hist1, 1.0);
		cvNormalizeHist(hist2, 1.0);
		cvReleaseImage(&dst1[i]);
		cvReleaseImage(&dst2[i]);
	}
	return cvCompareHist( hist1, hist2, CV_COMP_CORREL);
}
