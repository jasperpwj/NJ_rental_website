import random
import csv


def getRent():
    return random.randint(1000, 5000)
    
def getUserName():
    userNameList = []
    with open ("C:\\Users\\ChienI\\Desktop\\userInfo.txt", 'r') as f:
        for line in f:
            userNameList.append(line.split(',')[0])
    return userNameList

def getHouseInfo():
    houseInfoList = []
    with open ("C:\\Users\\ChienI\\Desktop\\new_house_info.txt", 'r') as f:
        for line in f:
            houseInfoList.append(line.split(':')[1][1:])
    return houseInfoList

def getStatementInfo():
    statementInfoList = []
    index = 0
    with open(
            'C:\\Users\\ChienI\\Documents\\WeChat Files\\Yeezy_Zhang\\FileStorage\\File\\2020-02\\listings.csv'
    ) as f:
        reader = csv.DictReader(f)
        for row in reader:
            statementInfoList.append(row['name'])
            index += 1
            if index > 49:
                break
    return statementInfoList

def getRoomtypeInfo():
    roomtypeInfoList = []
    index = 0
    with open(
            'C:\\Users\\ChienI\\Documents\\WeChat Files\\Yeezy_Zhang\\FileStorage\\File\\2020-02\\listings.csv'
    ) as f:
        reader = csv.DictReader(f)
        for row in reader:
            roomtypeInfoList.append(row['room_type'])
            index += 1
            if index > 49:
                break
    return roomtypeInfoList


def getOtherInfo():
    otherInfoList = []
    index = 0
    with open(
            'C:\\Users\\ChienI\\Documents\\WeChat Files\\Yeezy_Zhang\\FileStorage\\File\\2020-02\\listings.csv'
    ) as f:
        reader = csv.DictReader(f)
        for row in reader:
            userName = row['host_name']
            if userName not in otherInfoList and userName != "":
                otherInfoList.append("{},{},{}".format(row['name'], row['room_type'], getRent()))
                index += 1
                if index > 49:
                    break
    return otherInfoList


def create_csv():
    path = "C:\\Users\\ChienI\\Desktop\\houseInfo.csv"
    with open(path,'w', encoding='utf-8', newline='') as f:
        csv_write = csv.writer(f)
        csv_write.writerow(["username", "houseInfo", "statement", "roomType", "price"])



if __name__ == "__main__":
    houseInfoList = getHouseInfo()
    userNameList = getUserName()
    statementInfoList = getStatementInfo()
    roomtypeInfoList = getRoomtypeInfo()

    InfoList = []

    for i in range(50):
        tmpList = []
        tmpList.append(userNameList[i])
        tmpList.append(houseInfoList[i][:-1])
        tmpList.append(statementInfoList[i])
        tmpList.append(roomtypeInfoList[i])
        tmpList.append(getRent())

        InfoList.append(tmpList)

    path = "C:\\Users\\ChienI\\Desktop\\houseInfo.csv"

    with open(path,'w', encoding='utf-8') as f:
        csv_write = csv.writer(f)
        csv_write.writerow(["username", "houseInfo", "statement", "roomType", "price"])
    
    with open(path, 'r') as f:
        csv_write = csv.writer(f)
        for line in InfoList:
            csv_write.writerow(line)
    
