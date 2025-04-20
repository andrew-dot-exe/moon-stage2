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

public class LandfillBio extends Module implements Component {
    private final static int h = 2;
    private final static int w = 2;
    private final static double MAX_ANGLE = 10;

    private long mass = 0;

    public LandfillBio(Module module) {
        super(module.getId(), module.getId_user(), module.getId_zone(),
                module.getModule_type(), module.getX(), module.getY());
    }

    public LandfillBio(Long id, Long id_user, Integer id_zone, Integer module_type, Integer x, Integer y) {
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
        int src = 0, other = 50;
        for (Module module : modules){
            if(Objects.equals(module.getModule_type(), getModule_type())){
                other = 0;
            } else if (module.getModule_type() == TypeModule.LIVE_MODULE_Y.ordinal() ||
                        module.getModule_type() == TypeModule.LIVE_MODULE_X.ordinal()) {
                src = 50;
            }

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
        if(admin) return src + other;
        return null;
    }

    @Override
    public void getProduction(int idZone, List<Module> modules, List<Long> production) {
        double count = 0;
        for (Module module : modules){
            switch (TypeModule.values()[module.getModule_type()]){
                case LIVE_MODULE_X, LIVE_MODULE_Y -> count += 1.6;
                case PLANTATION -> count += 4.9;
            }
        }
        mass = (long) count;
        production.set(TypeResources.CO2.ordinal(), production.get(TypeResources.CO2.ordinal()) + mass * 1730);
        production.set(TypeResources.H2O.ordinal(), production.get(TypeResources.H2O.ordinal()) + mass * 560);
        production.set(TypeResources.GARBAGE.ordinal(), production.get(TypeResources.GARBAGE.ordinal()) + mass * 30);
    }

    @Override
    public void getConsumption(int idZone, List<Module> modules, List<Long> consumption) {
        consumption.set(TypeResources.WT.ordinal(), consumption.get(TypeResources.WT.ordinal()) + mass * 3);
        consumption.set(TypeResources.O2.ordinal(), consumption.get(TypeResources.O2.ordinal()) + mass * 1320);
    }

    @Override
    public boolean cross(int x, int y, int w, int h) {
        return (x >= getX() && x <= getX() + LandfillBio.w && y >= getY() && y <= getY() + LandfillBio.h) ||
                (getX() >= x && getX() <= x + w && getY() >= y && getY() <= y + h);
    }

    @Override
    public int getRadius() {
        return (h + w) / 4;
    }
}
