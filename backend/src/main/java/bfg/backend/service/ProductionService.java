package bfg.backend.service;

import bfg.backend.repository.link.Link;
import bfg.backend.repository.link.LinkRepository;
import bfg.backend.repository.module.Module;
import bfg.backend.repository.module.ModuleRepository;
import bfg.backend.repository.resource.Resource;
import bfg.backend.repository.resource.ResourceRepository;
import bfg.backend.service.logic.Component;
import bfg.backend.service.logic.TypeModule;
import bfg.backend.service.logic.TypeResources;
import bfg.backend.service.logic.zones.Zones;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
class ProductionService {

    public void recountingProduction(Long idUser, ModuleRepository moduleRepository,
                                     LinkRepository linkRepository, ResourceRepository resourceRepository){
        List<Module> modules = moduleRepository.findByIdUser(idUser);
        List<Link> links = linkRepository.findByIdUser(idUser);
        List<Resource> resources = resourceRepository.findByIdUser(idUser);
        resources.sort(Resource::compareTo);

        List<Long> production = new ArrayList<>(TypeResources.values().length);
        List<Long> consumption = new ArrayList<>(TypeResources.values().length);
        for (int j = 0; j < TypeResources.values().length; j++) {
            production.add(0L);
            consumption.add(0L);
        }

        for(Module mod : modules){
            Component component = TypeModule.values()[mod.getModule_type()].createModule(mod);
            component.getProduction(-1, modules, production);
            component.getConsumption(-1, modules, consumption);
        }

        long consWt = 0L;
        for(Link link : links){
            if(link.getPrimaryKey().getType() == 1){
                consWt += Zones.getZones().get(link.getPrimaryKey().getId_zone1()).getWays()[link.getPrimaryKey().getId_zone2()];
            }
        }
        consWt = consWt * 12L / 10000;

        for (int i = 0; i < resources.size() - 1; i++) { // dirty hack
            resources.get(i).setProduction(production.get(i));
            resources.get(i).setConsumption(consumption.get(i) + (i == TypeResources.WT.ordinal() ? consWt : 0L));
        }

        resourceRepository.saveAll(resources);
    }
}
