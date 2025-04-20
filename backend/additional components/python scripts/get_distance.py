import math

import rasterio


def correlation(bound, x, y):
    return bound.left < x < bound.right and bound.bottom < y < bound.top


def get_distance(map1: str, map2: str, x1: float, y1: float, x2: float, y2: float) -> float:
    if x1 == x2 and y1 == y2: return 0
    sum = 0
    size = 5
    diag = math.sqrt(50)
    with rasterio.open(map1) as dataset1:
        with rasterio.open(map2) as dataset2:
            if not ((correlation(dataset2.bounds, x1, y1) or correlation(dataset1.bounds, x1, y1)) and
                    (correlation(dataset2.bounds, x2, y2) or correlation(dataset1.bounds, x2, y2))):
                return None

            deltaX = math.fabs(x1 - x2)
            deltaY = math.fabs(y1 - y2)

            dx = deltaX / (deltaY + deltaX)
            orderX = 1 if x2 >= x1 else -1
            dy = deltaY / (deltaY + deltaX)
            orderY = 1 if y2 >= y1 else -1
            data = dataset2
            if correlation(dataset1.bounds, x1, y1):
                data = dataset1

            curX, curY = x1, y1
            newX, newY = x1, y1
            row, col = data.index(curX, curY)
            lastH = data.read(1, window=((row, row + 1), (col, col + 1)))[0][0]
            toX, toY = 0, 0

            while True:
                toX += dx
                toY += dy
                if toX >= 1:
                    newX += orderX
                    toX -= 1
                if toY >= 1:
                    newY += orderY
                    toY -= 1
                if newX == curX and newY == curY:
                    continue

                if not correlation(data.bounds, newX, newY):
                    if correlation(dataset1.bounds, newX, newY):
                        data = dataset1
                    elif correlation(dataset2.bounds, newX, newY):
                        data = dataset2
                    else:
                        sum += diag if (newX != curX and newY != curY) else size
                        curX, curY = newX, newY
                        while True:
                            toX += dx
                            toY += dy
                            if toX >= 1:
                                newX += orderX
                                toX -= 1
                            if toY >= 1:
                                newY += orderY
                                toY -= 1
                            if newX == curX and newY == curY:
                                continue
                            if correlation(dataset1.bounds, newX, newY):
                                data = dataset1
                                break
                            elif correlation(dataset2.bounds, newX, newY):
                                data = dataset2
                                break
                            sum += diag if (newX != curX and newY != curY) else size
                            curX, curY = newX, newY

                row, col = data.index(newX, newY)
                newH = data.read(1, window=((row, row + 1), (col, col + 1)))[0][0]

                sum += math.sqrt((newH - lastH) ** 2 + (diag if (newX != curX and newY != curY) else size) ** 2)

                lastH = newH
                curX, curY = newX, newY

                if math.fabs(x2 - curX) <= 1 and math.fabs(y2 - curY) <= 1:
                    row, col = data.index(x2, y2)
                    newH = data.read(1, window=((row, row + 1), (col, col + 1)))[0][0]
                    sum += math.sqrt((newH - lastH) ** 2 + (diag if (x2 != curX and y2 != curY) else size) ** 2)
                    break

                deltaX = math.fabs(curX - x2)
                deltaY = math.fabs(curY - y2)

                dx = deltaX / (deltaY + deltaX)
                orderX = 1 if x2 >= curX else -1
                dy = deltaY / (deltaY + deltaX)
                orderY = 1 if y2 >= curY else -1
        return sum
