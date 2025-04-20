import math

from CONFIG import *


def get_coordinates(x: int, y: int):
    # градусы, минуты, секунды
    coordinates = [[0] * 3, [0] * 3]
    resCoordinates = [0, 0]

    # долгота
    if x == y:
        if x > 0: coordinates[1][0] = 45
        elif x < 0: coordinates[1][0] = -135
        else:
            coordinates[0][0] = -90
            return coordinates
    elif x == 0:
        if y > 0: coordinates[1][0] = 0
        else: coordinates[1][0] = 180
    elif y == 0:
        if x > 0: coordinates[1][0] = 90
        else: coordinates[1][0] = -90
    else:
        a = math.atan(x / y) * 180 / math.pi
        if y < 0:
            if x > 0:
                a = 180 + a
            else:
                a = -180 + a
        coordinates[1][0] = math.trunc(a)
        coordinates[1][1] = math.trunc((a % 1) * 60)
        coordinates[1][2] = math.trunc(((a * 60) % 1) * 60)

    # широта
    second = 8.416
    b = (-90 * 3600) + 5 * math.sqrt(x ** 2 + y ** 2) / second
    coordinates[0][2] = round(b % 60)
    coordinates[0][1] = round((b / 60) % 60)
    coordinates[0][0] = round((b / 3600))

    # return coordinates координаты по градусам, минутам и секундам

    resCoordinates[0] = coordinates[0][2] + coordinates[0][1] * 60 + coordinates[0][2] * 3600
    resCoordinates[1] = coordinates[1][2] + coordinates[1][1] * 60 + coordinates[1][2] * 3600
    return resCoordinates # координаты по секундам
