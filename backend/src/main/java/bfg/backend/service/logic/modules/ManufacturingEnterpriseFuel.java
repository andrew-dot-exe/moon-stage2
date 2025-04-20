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

public class ManufacturingEnterpriseFuel extends Module implements Component {
    private final static int h = 1;
    private final static int w = 1;
    private final static double MAX_ANGLE = 10;

    public ManufacturingEnterpriseFuel(Module module) {
        super(module.getId(), module.getId_user(), module.getId_zone(),
                module.getModule_type(), module.getX(), module.getY());
    }

    public ManufacturingEnterpriseFuel(Long id, Long id_user, Integer id_zone, Integer module_type, Integer x, Integer y) {
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
        boolean admin = false;
        for (Module module : modules){

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
                if(module.getModule_type() == TypeModule.ADMINISTRATIVE_MODULE.ordinal() ||
                        module.getModule_type() == TypeModule.LIVE_ADMINISTRATIVE_MODULE.ordinal()){
                    admin = true;
                }
            }
        }
        if(admin) return Math.toIntExact(100 - (resources.get(TypeResources.FUEL.ordinal()).getProduction() * 30 * 6) / MASS * 100);
        return null;
    }

    @Override
    public void getProduction(int idZone, List<Module> modules, List<Long> production) {
        production.set(TypeResources.FUEL.ordinal(), production.get(TypeResources.FUEL.ordinal()) + 10000L);
    }

    @Override
    public void getConsumption(int idZone, List<Module> modules, List<Long> consumption) {
        consumption.set(TypeResources.WT.ordinal(), consumption.get(TypeResources.WT.ordinal()) + 212000L);
        consumption.set(TypeResources.H2O.ordinal(), consumption.get(TypeResources.H2O.ordinal()) + 4500L);
        consumption.set(TypeResources.CO2.ordinal(), consumption.get(TypeResources.CO2.ordinal()) + 5500L);
    }

    @Override
    public boolean cross(int x, int y, int w, int h) {
        return (x >= getX() && x <= getX() + ManufacturingEnterpriseFuel.w && y >= getY() && y <= getY() + ManufacturingEnterpriseFuel.h) ||
                (getX() >= x && getX() <= x + w && getY() >= y && getY() <= y + h);
    }

    @Override
    public int getRadius() {
        return (h + w) / 4;
    }
}
