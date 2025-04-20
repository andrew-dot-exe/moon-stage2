import math

import rasterio


def correlation(bound, x, y):
    return bound.left < x < bound.right and bound.bottom < y < bound.top


def get_avg_angle(dataset, x, y, h):
    size = 5  # Расстояние до соседей по вертикали/горизонтали
    diag = math.sqrt(2 * size ** 2)  # Диагональное расстояние
    sum_grad_x, sum_grad_y = 0, 0

    for i in range(-1, 2):
        for j in range(-1, 2):
            if i == 0 and j == 0:
                continue  # Пропускаем центральную точку

            # Определяем расстояние до соседа
            distance = size if i == 0 or j == 0 else diag

            # Получаем высоту соседа
            row, col = dataset.index(x + i, y + j)
            neighbor_h = dataset.read(1, window=((row, row + 1), (col, col + 1)))[0][0]

            # Вычисляем компоненты градиента
            diff = h - neighbor_h
            sum_grad_x += math.fabs(diff * i) / distance  # i отвечает за направление по x
            sum_grad_y += math.fabs(diff * j) / distance  # j отвечает за направление по y

    # Усредняем градиенты и вычисляем уклон
    avg_grad_x = sum_grad_x / 8
    avg_grad_y = sum_grad_y / 8
    slope_rad = math.atan(math.sqrt(avg_grad_x ** 2 + avg_grad_y ** 2))
    slope_deg = math.degrees(slope_rad)
    return slope_deg


def get_height(map1: str, map2: str, x: float, y: float, w: int):

    with rasterio.open(map1) as dataset1:
        with rasterio.open(map2) as dataset2:
            if not (correlation(dataset2.bounds, x, y) or correlation(dataset1.bounds, x, y)):
                return None
            dataset = None
            if correlation(dataset2.bounds, x, y):
                dataset = dataset2
            else:
                dataset = dataset1

            heights = [[0] * 2 for _ in range(w)]

            for i in range(w):
                if not correlation(dataset.bounds, x + i, y):
                    if correlation(dataset2.bounds, x + i, y):
                        dataset = dataset2
                    else:
                        dataset = dataset1
                row, col = dataset.index(x + i, y)
                heights[i][0] = dataset.read(1, window=((row, row + 1), (col, col + 1)))[0][0]
                heights[i][1] = get_avg_angle(dataset, x + i, y, heights[i][0])

            return heights

