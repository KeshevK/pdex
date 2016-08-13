from skimage.feature import hog
from skimage import data, color, exposure
from scipy.ndimage import imread
from sklearn.externals import joblib
from scipy.misc import imsave
import numpy as np
import matplotlib.pyplot as plt
from skimage.draw import line_aa
import sys
import ntpath
imfn = sys.argv[1]

#Validation on imfn 
#img = np.zeros((100, 100), dtype=np.uint8)
#rr, cc, val = line_aa(1, 1, 8, 4)
#img[rr, cc] = val * 255
#scipy.misc.imsave("C:\\Users\\Keshev\\Canopy\\PokeDex\\cutImages\\out.png", img)

#clf = joblib.load("C:\\Users\\Keshev\\Canopy\\PokeDex\\bestClassifier0726.pkl")
clf = joblib.load("C:\\Users\\Keshev\\Canopy\\PokeDex\\20160814clf.pkl")
clf2 = joblib.load("C:\\Users\\Keshev\\Canopy\\PokeDex\\clfs\\500SGD0812.pkl")
clf3 = joblib.load("C:\\Users\\Keshev\\Canopy\\PokeDex\\clfs\\500px.pkl")


def sliding_window(image, stepSize, windowSize):
	# slide a window across the image
	shp = image.shape
	for y in xrange(0, image.shape[0] - stepSize - shp[0] % stepSize, stepSize):
		for x in xrange(0, image.shape[1]- stepSize - shp[1]%stepSize, stepSize):
			# yield the current window
			if image[y:y + windowSize[1], x:x+windowSize[0]].shape == windowSize:
                            yield (x, y, image[y:y + windowSize[1], x:x + windowSize[0]])
def plotImg(image):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(8, 4), sharex=True, sharey=True)
    fd, hog_image = hog(image, orientations=8, pixels_per_cell=(14, 14),
                    cells_per_block=(1, 1), visualise=True)
    ax1.axis('off')
    ax1.imshow(image, cmap=plt.cm.gray)
    ax1.set_title('Input image')
    ax1.set_adjustable('box-forced')

    #Rescale histogram for better display
    hog_image_rescaled = exposure.rescale_intensity(hog_image, in_range=(0, 0.02))

    ax2.axis('off')
    ax2.imshow(hog_image_rescaled, cmap=plt.cm.gray)
    ax2.set_title('Histogram of Oriented Gradients')
    ax1.set_adjustable('box-forced')
    plt.show()
def detectObj(clf,clf2,clf3, imgfn, windowSize): 
    image = color.rgb2gray(imread(imgfn))
    w = sliding_window(image, 50, windowSize) 
    probDict = {}
    maxProb = [0,0,0]
    maxWin = [[],[],[]]
    for win in w: 
        fd = hog(win[2], orientations=8, pixels_per_cell=(16, 16),
                cells_per_block=(1, 1), visualise=False)
        try:
            prob = clf3.predict_proba(fd)[0][1] 
            #prob = clf3.predict_proba(fd)[0][1]*10000 + clf.predict_proba(fd)[0][1] + clf2.predict_proba(fd)[0][1]/1000
            if prob > min(maxProb): 
                ind = maxProb.index(min(maxProb))
                maxProb[ind] = prob
                maxWin[ind] = win
            #probDict[prob] = win 
        except ValueError: 
            print "err"
            
    return maxWin        
    
#detectObj(clf,imfn,(450,450))
#imfn ="C:\\Users\\Keshev\\Canopy\\PokeDex\\Images\\00087_1_Antilope_480x480_spc1.2_good.png"
ww = detectObj(clf,clf2,clf3,imfn,(500,500))
newpth = "C:\\Users\\Keshev\\Canopy\\PokeDex\\startupWS\\images\\" + ntpath.basename(imfn)
#print ww
imsave("C:\\Users\\Keshev\\Canopy\\PokeDex\\startupWS\\images\\" + ntpath.basename(imfn), ww[0][2])
import time 
time.sleep(10)
print newpth