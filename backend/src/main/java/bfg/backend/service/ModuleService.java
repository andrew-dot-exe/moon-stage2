package bfg.backend.service;

import bfg.backend.dto.request.modulePlace.ModulePlace;
import bfg.backend.dto.responce.optimality.Optimality;
import bfg.backend.repository.link.Link;
import bfg.backend.repository.link.LinkRepository;
import bfg.backend.repository.module.Module;
import bfg.backend.repository.module.ModuleRepository;
import bfg.backend.repository.resource.Resource;
import bfg.backend.repository.resource.ResourceRepository;
import bfg.backend.repository.user.User;
import bfg.backend.repository.user.UserRepository;
import bfg.backend.service.logic.Component;
import bfg.backend.service.logic.TypeModule;
import bfg.backend.service.logic.TypeResources;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final UserRepository userRepository;
    private final LinkRepository linkRepository;
    private final ResourceRepository resourceRepository;

    private final ProductionService productionService;
    private final CheckPlaceService checkPlaceService;

    public ModuleService(ModuleRepository moduleRepository, UserRepository userRepository, LinkRepository linkRepository, ResourceRepository resourceRepository, ProductionService productionService, CheckPlaceService checkPlaceService) {
        this.moduleRepository = moduleRepository;
        this.userRepository = userRepository;
        this.linkRepository = linkRepository;
        this.resourceRepository = resourceRepository;
        this.productionService = productionService;
        this.checkPlaceService = checkPlaceService;
    }

    public void delete(Long idUser, Long id) {
        Optional<User> optionalUser = userRepository.findById(idUser);
        if(optionalUser.isEmpty()){
            throw new RuntimeException("Такого пользователя нет");
        }
        User user = optionalUser.get();
        if(!user.getLive()){
            throw new RuntimeException("Данный пользоваель завершил колнизацию");
        }
        Optional<Module> optionalModule = moduleRepository.findById(id);
        if(optionalModule.isEmpty()){
            throw new RuntimeException("Такого модуля нет");
        }
        Module module = optionalModule.get();
        if(module.getId_user().equals(idUser)){
            moduleRepository.delete(module);
            productionService.recountingProduction(idUser, moduleRepository, linkRepository, resourceRepository);
        }
        else {
            throw new RuntimeException("Такого модуля нет");
        }
    }

    public Integer create(Module module) {
        if(!checkPlaceService.check(new ModulePlace(module.getId_user(), module.getModule_type(),
                module.getX(), module.getY(), module.getId_zone())).possible()){
            throw new RuntimeException("Нельзя поставить в этом месте");
        }

        Optional<User> optionalUser = userRepository.findById(module.getId_user());
        if(optionalUser.isEmpty()){
            throw new RuntimeException("Такого пользователя нет");
        }
        User user = optionalUser.get();
        if(!user.getLive()){
            throw new RuntimeException("Данный пользоваель завершил колнизацию");
        }
/*
        if(moduleRepository.findById(module.getId()).isPresent()){
            throw new RuntimeException("Такой модуль уже есть");
        }*/
        moduleRepository.save(module);

        productionService.recountingProduction(module.getId_user(), moduleRepository, linkRepository, resourceRepository);

        Optional<Resource> optionalResource = resourceRepository.findById(new Resource.PrimaryKey(TypeResources.MATERIAL.ordinal(), module.getId_user()));
        if(optionalResource.isEmpty()){
            throw new RuntimeException("Такого ресурса нет (как так?)");
        }
        Resource mat = optionalResource.get();
        int cost = TypeModule.values()[module.getModule_type()].getCost();
        mat.setCount(mat.getCount() - cost);
        if(mat.getCount() < 0){
            user.setLive(false);
            userRepository.save(user);
        }

        return cost;
    }

    public List<Optimality> getOptimality(Long idUser){
        Optional<User> optionalUser = userRepository.findById(idUser);
        if(optionalUser.isEmpty()){
            throw new RuntimeException("Нет такого пользователя");
        }
        User user = optionalUser.get();

        List<Module> modules = moduleRepository.findByIdUser(user.getId());
        List<Link> links = linkRepository.findByIdUser(user.getId());
        List<Resource> resources = resourceRepository.findByIdUser(user.getId());

        List<Optimality> optimalityList = new ArrayList<>(modules.size());
        for (int i = 0; i < modules.size(); i++) {
            Component component = TypeModule.values()[modules.get(i).getModule_type()].createModule(modules.get(i));
            Integer relief = component.getRelief();
            Integer rationality = component.getRationality(modules, links, resources);
            optimalityList.add(new Optimality(modules.get(i).getId(), relief, rationality));
        }

        return optimalityList;
    }
}
