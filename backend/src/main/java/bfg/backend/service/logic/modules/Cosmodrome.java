package bfg.backend.service.logic.modules;

import bfg.backend.repository.link.Link;
import bfg.backend.repository.module.Module;
import bfg.backend.repository.resource.Resource;
import bfg.backend.service.logic.Component;
import bfg.backend.service.logic.TypeModule;
import bfg.backend.service.logic.zones.Zones;

import java.util.List;
import java.util.Objects;

public class Cosmodrome extends Module implements Component {
    private final static int h = 6;
    private final static int w = 6;
    private final static double MAX_ANGLE = 5;

    public Cosmodrome(Module module) {
        super(module.getId(), module.getId_user(), module.getId_zone(),
                module.getModule_type(), module.getX(), module.getY());
    }

    public Cosmodrome(Long id, Long id_user, Integer id_zone, Integer module_type, Integer x, Integer y) {
        super(id, id_user, id_zone, module_type, x, y);
    }

    @Override
    public Integer getRelief() {
        int x = getX();
        int y = getY();
        double maxAngle = 0;
        for (int i = 0; i < h; i++) {
            for (int j = 0; j < w; j++) {
                try {
                    maxAngle = Math.max(maxAngle, Zones.getZones().get(getId_zone()).getCells()[y + i][x + j].getAngle());
                }catch (ArrayIndexOutOfBoundsException e){
                    return null;
                }
            }
        }
        int res = (int) ((MAX_ANGLE - maxAngle) * 10);
        if(res <= 0) return null;
        return res;
    }

    @Override
    public Integer getRationality(List<Module> modules, List<Link> links, List<Resource> resources) {
        for (Module value : modules) {
            if (Objects.equals(value.getModule_type(), getModule_type())) {
                if(Objects.equals(value.getId(), getId())) continue;
                return null;
            }
        }
        int count1 = 0;
        int count2 = 0;
        int count3 = 0;
        int count4 = 0;
        for (Module module : modules) {
            switch (TypeModule.values()[module.getModule_type()]) {
                case WAREHOUSE_FOOD -> count1 = 1;
                case WAREHOUSE_FUEL -> count2 = 1;
                case WAREHOUSE_GASES -> count3 = 1;
                case WAREHOUSE_MATERIAL -> count4 = 1;
            }
        }
        return 20 + 20 * (count1 + count2 + count3 + count4);
    }

    @Override
    public void getProduction(int idZone, List<Module> modules, List<Long> production) {

    }

    @Override
    public void getConsumption(int idZone, List<Module> modules, List<Long> consumption) {

    }

    @Override
    public boolean cross(int x, int y, int w, int h) {
        return (x >= getX() && x <= getX() + Cosmodrome.w && y >= getY() && y <= getY() + Cosmodrome.h) ||
                (getX() >= x && getX() <= x + w && getY() >= y && getY() <= y + h);
    }

    @Override
    public int getRadius() {
        return 0;
    }
}
