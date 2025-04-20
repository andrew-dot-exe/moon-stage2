package bfg.backend.service.logic.modules;

import bfg.backend.repository.link.Link;
import bfg.backend.repository.module.Module;
import bfg.backend.repository.resource.Resource;
import bfg.backend.service.logic.Component;
import bfg.backend.service.logic.TypeModule;
import bfg.backend.service.logic.TypeResources;
import bfg.backend.service.logic.zones.Zones;

import java.util.List;
import java.util.Objects;

import static bfg.backend.service.logic.Constants.*;
import static bfg.backend.service.logic.Constants.DANGER_ZONE;

public class Plantation extends Module implements Component {
    private final static int h = 3;
    private final static int w = 3;
    private final static double MAX_ANGLE = 10;

    public Plantation(Module module) {
        super(module.getId(), module.getId_user(), module.getId_zone(),
                module.getModule_type(), module.getX(), module.getY());
    }

    public Plantation(Long id, Long id_user, Integer id_zone, Integer module_type, Integer x, Integer y) {
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
        if(!enoughPeople(modules, getId())) return null;
        boolean connect = false;
        for(Module module : modules){
            if(Objects.equals(module.getId_zone(), getId_zone())){
                if(Objects.equals(module.getId(), getId())) continue;
                Component c = TypeModule.values()[module.getModule_type()].createModule(module);
                if(c.cross(getX(), getY(), w, h)){
                    return null;
                }
                if(module.getModule_type() == TypeModule.COSMODROME.ordinal()){
                    if(cross(module.getX() - DANGER_ZONE, module.getY() - DANGER_ZONE,
                            COSMODROME_W + 2 * DANGER_ZONE, COSMODROME_H + 2 * DANGER_ZONE)){
                        return null;
                    }
                }
                if(!connect && TypeModule.values()[module.getModule_type()].isLive()){
                    connect = c.cross(getX() + 1, getY(), w, h) || c.cross(getX() - 1, getY(), w, h) ||
                            c.cross(getX(), getY() + 1, w, h) || c.cross(getX(), getY() - 1, w, h);
                }
            }
        }
        if(connect){
            return Math.toIntExact(Math.min(100, resources.get(TypeResources.FOOD.ordinal()).getProduction() /
                    resources.get(TypeResources.FOOD.ordinal()).getConsumption() * 1000 / 3));
        }
        return null;
    }

    @Override
    public void getProduction(int idZone, List<Module> modules, List<Long> production) {
        production.set(TypeResources.FOOD.ordinal(), production.get(TypeResources.FOOD.ordinal()) + 1640);
        production.set(TypeResources.O2.ordinal(), production.get(TypeResources.O2.ordinal()) + 3650);
    }

    @Override
    public void getConsumption(int idZone, List<Module> modules, List<Long> consumption) {
        consumption.set(TypeResources.CO2.ordinal(), consumption.get(TypeResources.CO2.ordinal()) + 5000);
        consumption.set(TypeResources.H2O.ordinal(), consumption.get(TypeResources.H2O.ordinal()) + 25350);
        consumption.set(TypeResources.WT.ordinal(), consumption.get(TypeResources.WT.ordinal()) + 175000L);

    }

    @Override
    public boolean cross(int x, int y, int w, int h) {
        return (x >= getX() && x <= getX() + Plantation.w && y >= getY() && y <= getY() + Plantation.h) ||
                (getX() >= x && getX() <= x + w && getY() >= y && getY() <= y + h);
    }

    @Override
    public int getRadius() {
        return 0;
    }
}
