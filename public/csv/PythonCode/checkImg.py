import cv2 as cv
import numpy as np

# check if the photos in the folder are same
path = "D:\\housePhoto"
for i in range(1, 55):

    ori_img = cv.imread("{}\\{}\\1.jpg".format(path, i))
    x, y = ori_img.shape[0], ori_img.shape[1]
    for j in range(i + 1, 56):
        check_img = cv.imread("{}\\{}\\1.jpg".format(path, j))
        xx, yy = check_img.shape[0], check_img.shape[1]
        if (xx != x) or (yy != y):
            continue
        else:
            difference = cv.subtract(ori_img, check_img)
            result = not np.any(difference)

            if result is True:
                print("{} {} is the same".format(i, j))
