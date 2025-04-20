package bfg.backend.service.logic.modules;

import bfg.backend.repository.link.Link;
import bfg.backend.repository.module.Module;
import bfg.backend.repository.resource.Resource;
import bfg.backend.service.logic.Component;
import bfg.backend.service.logic.TypeModule;
import bfg.backend.service.logic.TypeResources;
import bfg.backend.service.logic.zones.Zones;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static bfg.backend.service.logic.Constants.*;

public class RepairModule extends Module implements Component {
    private final static int h = 2;
    private final static int w = 2;
    private final static double MAX_ANGLE = 10;

    private int count = 0;

    public RepairModule(Module module) {
        super(module.getId(), module.getId_user(), module.getId_zone(),
                module.getModule_type(), module.getX(), module.getY());
    }

    public RepairModule(Long id, Long id_user, Integer id_zone, Integer module_type, Integer x, Integer y) {
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
        boolean cur = false;

        modules.sort(Module::compareTo);
        List<Component> repair = new ArrayList<>();

        for (Module module : modules){
            if(Objects.equals(module.getId(), getId())) {
                cur = true;
                for(Component component : repair){
                    if(component.cross(getX() - REPAIR_ZONE, getY() - REPAIR_ZONE,
                            w + 2 * REPAIR_ZONE, h + 2 * REPAIR_ZONE)){
                        repair.remove(component);
                        count++;
                        if(count == MAX_COUNT_REPAIRED) break;
                    }
                }
                continue;
            }

            if(Objects.equals(module.getId_zone(), getId_zone())){
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
                if(!cur && Objects.equals(module.getModule_type(), getModule_type())){
                    int co = MAX_COUNT_REPAIRED;
                    for(Component component : repair){
                        if(component.cross(getX() - REPAIR_ZONE, getY() - REPAIR_ZONE,
                                w + 2 * REPAIR_ZONE, h + 2 * REPAIR_ZONE)){
                            repair.remove(component);
                            co--;
                            if(co == 0) break;
                        }
                    }
                } else if (cur) {
                    if(count < MAX_COUNT_REPAIRED && c.cross(getX() - REPAIR_ZONE, getY() - REPAIR_ZONE,
                            w + 2 * REPAIR_ZONE, h + 2 * REPAIR_ZONE)){
                        count++;
                    }
                }
                else {
                    repair.add(c);
                }
            }
        }
        if(admin) return count / MAX_COUNT_REPAIRED * 100;
        return null;
    }

    @Override
    public void getProduction(int idZone, List<Module> modules, List<Long> production) {}

    @Override
    public void getConsumption(int idZone, List<Module> modules, List<Long> consumption) {
        boolean cur = false;

        modules.sort(Module::compareTo);
        List<Component> repair = new ArrayList<>();

        for (Module module : modules){
            if(Objects.equals(module.getId(), getId())) {
                cur = true;
                for(Component component : repair){
                    if(component.cross(getX() - REPAIR_ZONE, getY() - REPAIR_ZONE,
                            w + 2 * REPAIR_ZONE, h + 2 * REPAIR_ZONE)){
                        repair.remove(component);
                        count++;
                        if(count == MAX_COUNT_REPAIRED) break;
                    }
                }
                continue;
            }

            if(Objects.equals(module.getId_zone(), getId_zone())){
                Component c = TypeModule.values()[module.getModule_type()].createModule(module);
                if(!cur && Objects.equals(module.getModule_type(), getModule_type())){
                    int co = MAX_COUNT_REPAIRED;
                    for(Component component : repair){
                        if(component.cross(getX() - REPAIR_ZONE, getY() - REPAIR_ZONE,
                                w + 2 * REPAIR_ZONE, h + 2 * REPAIR_ZONE)){
                            repair.remove(component);
                            co--;
                            if(co == 0) break;
                        }
                    }
                } else if (cur) {
                    if(count < MAX_COUNT_REPAIRED && c.cross(getX() - REPAIR_ZONE, getY() - REPAIR_ZONE,
                            w + 2 * REPAIR_ZONE, h + 2 * REPAIR_ZONE)){
                        count++;
                    }
                }
                else {
                    repair.add(c);
                }
            }
        }

        consumption.set(TypeResources.WT.ordinal(), consumption.get(TypeResources.WT.ordinal()) + 4800L + 2000L * count);
        consumption.set(TypeResources.MATERIAL.ordinal(), (long) (consumption.get(TypeResources.MATERIAL.ordinal()) + CON_MATERIAL_BY_REPAIRED * count * 1000));
    }

    @Override
    public boolean cross(int x, int y, int w, int h) {
        return (x >= getX() && x <= getX() + RepairModule.w && y >= getY() && y <= getY() + RepairModule.h) ||
                (getX() >= x && getX() <= x + w && getY() >= y && getY() <= y + h);
    }

    @Override
    public int getRadius() {
        return (h + w) / 4;
    }
}
