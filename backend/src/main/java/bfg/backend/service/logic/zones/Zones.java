package bfg.backend.service.logic.zones;

import java.util.ArrayList;
import java.util.List;

import static bfg.backend.service.logic.Constants.ILLUMINATION;

public class Zones {
    private static final List<Area> areas;
    private static final int LENGTH = 6;

    static {
        areas = new ArrayList<>(LENGTH);
        String[] names = {"Равнина 1","Равнина 2","Высота 1","Высота 2","Низина 1","Низина 2"};
        String path = System.getProperty("user.dir") + "/src/main/resources/zones/";
        for (int i = 0; i < LENGTH; i++) {
            areas.add(new Area(ILLUMINATION[i], path + names[i] + ".txt", names[i]));
        }
    }

    public static List<Area> getZones(){return areas;}

    public static int getLength(){return LENGTH;}
}
