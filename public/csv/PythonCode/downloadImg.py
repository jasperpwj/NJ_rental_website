import os
import time
import requests
from selenium import webdriver

options = webdriver.ChromeOptions()
options.add_argument('--user-data-dir=C:\\Users\\ChienI\\AppData\\Local\\Google\\Chrome\\User Data')
options.add_experimental_option('excludeSwitches', ['enable-automation'])
browser = webdriver.Chrome(chrome_options=options)
browser.maximize_window()

airbnb_url = "https://zh.airbnb.com/s/Jersey-City--NJ--United-States/homes?refinement_paths%5B%5D=%2Fhomes&current_tab_id=home_tab&selected_tab_id=home_tab&screen_size=large&hide_dates_and_guests_filters=false&place_id=ChIJ3a-_JdJQwokR2SXNohPwSQI&s_tag=251BYyek&section_offset=4&items_offset=40&last_search_session_id=3342e433-8b9f-4b1c-812c-b1041847c82e"
browser.get(airbnb_url)

time.sleep(5)

img_url_1 = '/html/body/div[3]/main/section/div[1]/div/div[1]/div/div/div[1]/div[1]/img[2]'
img_url_2 = '/html/body/div[3]/main/section/div[1]/div/div[1]/div/div/div[1]/div[2]/div[1]/img[2]'
img_url_3 = '/html/body/div[3]/main/section/div[1]/div/div[1]/div/div/div[1]/div[2]/div[2]/img[2]'
img_url_4 = '/html/body/div[3]/main/section/div[1]/div/div[1]/div/div/div[1]/div[3]/div[1]/img[2]'
img_url_5 = '/html/body/div[3]/main/section/div[1]/div/div[1]/div/div/div[1]/div[3]/div[2]/img[2]'

urlList = [img_url_1, img_url_2, img_url_3, img_url_4, img_url_5]

for house_index in range(1, 21):
    path = '/html/body/div[3]/main/div/div/div/div[3]/div/div/section/div/div/div/div/div/div[2]/div/div/div/div/div[{}]/div/div/div/div/div/div/div[1]/div/div[2]/div/div/div/div[2]/div/a'.format(
        house_index)
    xpath = browser.find_element_by_xpath(path)
    img_url = xpath.get_attribute('href')
    browser.get(img_url)

    time.sleep(5)

    imgList = []
    for xpath in urlList:
        img_xpath = browser.find_element_by_xpath(xpath)
        img_src = img_xpath.get_attribute('src')
        imgList.append(img_src.split('?')[0])

    dir_name = 'D:\\housePhoto\\{}'.format(house_index + 40)
    os.mkdir(dir_name)

    index = 1
    for url in imgList:
        r = requests.get(url, verify=False)
        with open(dir_name + '\\{}.jpg'.format(index), 'wb') as f:
            f.write(r.content)
        index += 1

    browser.get(airbnb_url)
    time.sleep(5)
