package bfg.backend.service.logic;

import bfg.backend.repository.link.Link;
import bfg.backend.repository.module.Module;
import bfg.backend.repository.resource.Resource;

import java.util.List;

public interface Component {

    Integer getRelief();

    Integer getRationality(List<Module> modules, List<Link> links, List<Resource> resources);

    void getProduction(int idZone, List<Module> modules, List<Long> production);

    void getConsumption(int idZone, List<Module> modules, List<Long> consumption);

    default boolean enoughPeople(List<Module> modules, long id){
        modules.sort(Module::compareTo);
        int countPeople = 0;
        int needPeople = 0;
        boolean cur = false;
        for(Module module : modules){
            if(module.getModule_type() == TypeModule.LIVE_MODULE_Y.ordinal() ||
                module.getModule_type() == TypeModule.LIVE_MODULE_X.ordinal()){
                countPeople += 8;
                continue;
            }
            if(!cur){
                needPeople += TypeModule.values()[module.getModule_type()].getPeople();
            }
            if(module.getId() == id) cur = true;
        }
        return countPeople >= needPeople;
    }

    boolean cross(int x, int y, int w, int h);

    int getRadius();

    // для проверки связанности областей
    class UnionFind {
        private int[] parent;
        private int[] rank;

        public UnionFind(int size) {
            parent = new int[size + 1]; // Для точек 1..size
            rank = new int[size + 1];
            for (int i = 0; i <= size; i++) {
                parent[i] = i;
            }
        }

        public int find(int x) {
            if (parent[x] != x) {
                parent[x] = find(parent[x]); // Сжатие пути
            }
            return parent[x];
        }

        public void union(int x, int y) {
            int rootX = find(x);
            int rootY = find(y);
            if (rootX != rootY) {
                if (rank[rootX] > rank[rootY]) {
                    parent[rootY] = rootX;
                } else if (rank[rootX] < rank[rootY]) {
                    parent[rootX] = rootY;
                } else {
                    parent[rootY] = rootX;
                    rank[rootX]++;
                }
            }
        }
    }
}
