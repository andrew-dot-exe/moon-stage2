from CONFIG import *
from get_height import *
from get_coordinates import *
from get_distance import *

if __name__ == "__main__":
    file = open(zones[0][2] + ".txt", "w")
    file.write(f"{zones[0][3]} {zones[0][4]}")

    for k in range(6):
        print(f"Zone: {k}")
        file = open("zones/" + zones[k][2] + ".txt", "w")
        w, h = zones[k][3], zones[k][4]
        file.write(f"{w} {h}\n")
        for i in range(h):
            heights = get_height(SCH_PATH_LEFT, SCH_PATH_TOP, zones[k][0], zones[k][1] + i, w)
            str = []
            for j in range(w):
                coord = get_coordinates(zones[k][0] + j, zones[k][1] + i)
                str.append(f"{round(heights[j][0])} {round(heights[j][1], 2)} {coord[0]} {coord[1]};")
            file.write(f"{''.join(str)}\n")

        str = []
        for i in range(6):
            str.append(f"{round(get_distance(SCH_PATH_LEFT, SCH_PATH_TOP, zones[k][0], zones[k][1], zones[i][0], zones[i][1]))} ")
        file.write(f"{''.join(str)}\n")
        file.close()



