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

public class LiveAdministrativeModule extends Module implements Component {
    private final static int h = 2;
    private final static int w = 2;
    private final static double MAX_ANGLE = 10;

    public LiveAdministrativeModule(Module module) {
        super(module.getId(), module.getId_user(), module.getId_zone(),
                module.getModule_type(), module.getX(), module.getY());
    }

    public LiveAdministrativeModule(Long id, Long id_user, Integer id_zone, Integer module_type, Integer x, Integer y) {
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
        int cos = -1;
        for (int i = 0; i < modules.size(); i++) {
            if(Objects.equals(modules.get(i).getId_zone(), getId_zone())) {
                if (Objects.equals(modules.get(i).getModule_type(), getModule_type()) ||
                        modules.get(i).getModule_type() == TypeModule.LIVE_ADMINISTRATIVE_MODULE.ordinal()) {
                    return null;
                }
            }
            if(modules.get(i).getModule_type() == TypeModule.COSMODROME.ordinal()) cos = i;
        }
        if(cos == -1) return null;

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
            }
        }

        if(Objects.equals(getId_zone(), modules.get(cos).getId_zone())) return 100;

        UnionFind unionFind = new UnionFind(Zones.getLength());
        for (Link link: links){
            if(link.getPrimaryKey().getType() == 1) continue;
            unionFind.union(link.getPrimaryKey().getId_zone1(), link.getPrimaryKey().getId_zone2());
        }

        if(unionFind.find(cos) == unionFind.find(getId_zone())) return 100;
        return null;
    }

    @Override
    public void getProduction(int idZone, List<Module> modules, List<Long> production) {}

    @Override
    public void getConsumption(int idZone, List<Module> modules, List<Long> consumption) {
        consumption.set(TypeResources.WT.ordinal(), consumption.get(TypeResources.WT.ordinal()) + 36800L);
    }

    @Override
    public boolean cross(int x, int y, int w, int h) {
        return (x >= getX() && x <= getX() + LiveAdministrativeModule.w && y >= getY() && y <= getY() + LiveAdministrativeModule.h) ||
                (getX() >= x && getX() <= x + w && getY() >= y && getY() <= y + h);
    }

    @Override
    public int getRadius() {
        return 0;
    }
}
