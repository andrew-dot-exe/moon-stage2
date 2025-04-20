package bfg.backend.service.logic.modules;

import bfg.backend.repository.link.Link;
import bfg.backend.repository.module.Module;
import bfg.backend.repository.resource.Resource;
import bfg.backend.service.logic.Component;
import bfg.backend.service.logic.TypeModule;
import bfg.backend.service.logic.TypeResources;
import bfg.backend.service.logic.zones.Zones;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

import static bfg.backend.service.logic.Constants.SIZE_CELL;

public class SolarPowerPlant extends Module implements Component {
    private final static int h = 1;
    private final static int w = 1;
    private final static double MAX_ANGLE = 10;

    public SolarPowerPlant(Module module) {
        super(module.getId(), module.getId_user(), module.getId_zone(),
                module.getModule_type(), module.getX(), module.getY());
    }

    public SolarPowerPlant(Long id, Long id_user, Integer id_zone, Integer module_type, Integer x, Integer y) {
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
        ShadowCalculator shadowCalculator = new ShadowCalculator();
        SolarObject solarObject = new SolarObject(getX() * SIZE_CELL, getY() * SIZE_CELL, getRadius());
        for (Module module : modules){

            if(Objects.equals(module.getId_zone(), getId_zone())){
                if(Objects.equals(module.getId(), getId())) continue;
                Component c = TypeModule.values()[module.getModule_type()].createModule(module);
                if(c.cross(getX(), getY(), w, h)){
                    return null;
                }
                if(module.getModule_type() == TypeModule.ADMINISTRATIVE_MODULE.ordinal() ||
                        module.getModule_type() == TypeModule.LIVE_ADMINISTRATIVE_MODULE.ordinal()){
                    admin = true;
                }
                shadowCalculator.addShadow(solarObject,
                        new SolarObject(module.getX() * SIZE_CELL, module.getY() * SIZE_CELL, c.getRadius()));
            }
        }
        if(admin){
            return (int) shadowCalculator.calculateTotalEfficiency(Zones.getZones().get(getId_zone()).getIllumination());
        }
        return null;
    }

    @Override
    public void getProduction(int idZone, List<Module> modules, List<Long> production) {
        production.set(TypeResources.WT.ordinal(), production.get(TypeResources.WT.ordinal()) + 162500L * getRationality(modules, null, null));
    }

    @Override
    public void getConsumption(int idZone, List<Module> modules, List<Long> consumption) {
        consumption.set(TypeResources.WT.ordinal(), consumption.get(TypeResources.WT.ordinal()) + 1200L);
    }

    @Override
    public boolean cross(int x, int y, int w, int h) {
        return (x >= getX() && x <= getX() + SolarPowerPlant.w && y >= getY() && y <= getY() + SolarPowerPlant.h) ||
                (getX() >= x && getX() <= x + w && getY() >= y && getY() <= y + h);
    }

    @Override
    public int getRadius() {
        return (h + w) / 4;
    }

    /**
     * @param x      координата X
     * @param y      координата Y
     * @param radius радиус объекта
     */
    record SolarObject(double x, double y, double radius) {

        /**
             * Вычисляет расстояние до другого объекта
             */
            public double distanceTo(SolarObject other) {
                return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
            }

            /**
             * Вычисляет угол (в градусах) от текущего объекта к другому
             * Возвращает значение от 0 до 360
             */
            public double angleTo(SolarObject other) {
                double dx = other.x - this.x;
                double dy = other.y - this.y;
                double angle = Math.toDegrees(Math.atan2(dy, dx));
                return (angle + 360) % 360; // Нормализуем угол к [0, 360)
            }
        }

    static class ShadowCalculator {
        private static final int DEGREES = 360;
        private final boolean[] illumination; // Массив освещенности

        public ShadowCalculator() {
            illumination = new boolean[DEGREES];
            Arrays.fill(illumination, true); // Изначально все углы освещены
        }

        /**
         * Добавляет тень от объекта
         * @param station - солнечная станция
         * @param obstacle - препятствие
         */
        public void addShadow(SolarObject station, SolarObject obstacle) {
            double distance = station.distanceTo(obstacle);
            double angle = station.angleTo(obstacle);
            double shadowAngle = 2 * Math.toDegrees(Math.asin(obstacle.radius() / distance));

            markShadow(angle, shadowAngle);
        }

        /**
         * Помечает углы как затененные
         * @param centerAngle - центральный угол тени
         * @param shadowWidth - ширина тени в градусах
         */
        private void markShadow(double centerAngle, double shadowWidth) {
            int start = (int)Math.round(centerAngle - shadowWidth/2 + DEGREES) % DEGREES;
            int end = (int)Math.round(centerAngle + shadowWidth/2 + DEGREES) % DEGREES;

            if (start < end) {
                for (int i = start; i <= end; i++) {
                    illumination[i % DEGREES] = false;
                }
            } else {
                // Обрабатываем переход через 360°
                for (int i = start; i < DEGREES; i++) {
                    illumination[i] = false;
                }
                for (int i = 0; i <= end; i++) {
                    illumination[i] = false;
                }
            }
        }

        /**
         * Вычисляет относительную эффективность
         * @return эффективность в процентах
         */
        public double calculateEfficiency() {
            int illuminatedCount = 0;
            for (boolean lit : illumination) {
                if (lit) illuminatedCount++;
            }
            return (illuminatedCount * 100.0) / DEGREES;
        }

        /**
         * Вычисляет итоговую эффективность станции
         * @param maxEfficiency - максимальная эффективность станции
         */
        public double calculateTotalEfficiency(double maxEfficiency) {
            return maxEfficiency * calculateEfficiency() / 100.0;
        }
    }
}
