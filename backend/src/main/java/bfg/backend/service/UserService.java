package bfg.backend.service;

import bfg.backend.dto.request.user.UserIn;
import bfg.backend.dto.responce.allUserInfo.AllUserInfo;
import bfg.backend.dto.responce.statistics.Statistics;
import bfg.backend.dto.responce.statistics.ZoneProduction;
import bfg.backend.mapping.MappingToResponse;
import bfg.backend.repository.link.*;
import bfg.backend.repository.module.Module;
import bfg.backend.repository.module.ModuleRepository;
import bfg.backend.repository.resource.*;
import bfg.backend.repository.user.*;
import bfg.backend.service.logic.Component;
import bfg.backend.service.logic.TypeModule;
import bfg.backend.service.logic.TypeResources;
import bfg.backend.service.logic.zones.Zones;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final LinkRepository linkRepository;
    private final ModuleRepository moduleRepository;
    private final ResourceRepository resourceRepository;
    private final SuccessfulService successfulService;

    public UserService(UserRepository userRepository, LinkRepository linkRepository, ModuleRepository moduleRepository, ResourceRepository resourceRepository, SuccessfulService successfulService) {
        this.userRepository = userRepository;
        this.linkRepository = linkRepository;
        this.moduleRepository = moduleRepository;
        this.resourceRepository = resourceRepository;
        this.successfulService = successfulService;
    }

    public AllUserInfo find(UserIn userIn){
        Optional<User> optionalUser = userRepository.findByEmail(userIn.email());
        if(optionalUser.isEmpty()){
            return null;
        }
        User user = optionalUser.get();
        if(!user.getPassword().equals(userIn.password())){
            return null;
        }

        List<Module> modules = moduleRepository.findByIdUser(user.getId());
        List<Link> links = linkRepository.findByIdUser(user.getId());
        List<Resource> resources = resourceRepository.findByIdUser(user.getId());

        return MappingToResponse.mapToAllUserInfo(user, modules, links, resources);
    }

    // TODO потребление электричества за гидролиз кислорода
    public Statistics getStatistics(Long idUser){
        Optional<User> optionalUser = userRepository.findById(idUser);
        if(optionalUser.isEmpty()){
            throw new RuntimeException("Такого пользователя нет");
        }
        User user = optionalUser.get();

        List<Module> modules = moduleRepository.findByIdUser(user.getId());
        List<Resource> resources = resourceRepository.findByIdUser(user.getId());
        resources.sort(Resource::compareTo);

        List<Long> count = new ArrayList<>(resources.size());
        List<Long> sproduction = new ArrayList<>(resources.size());
        List<Long> sconsumption = new ArrayList<>(resources.size());
        List<ZoneProduction> zoneProductions = new ArrayList<>(Zones.getLength());

        for (Resource resource : resources){
            count.add(resource.getCount());
            sproduction.add(resource.getSum_production());
            sconsumption.add(resource.getSum_consumption());
        }

        for (int i = 0; i < Zones.getLength(); i++) {
            List<Long> production = new ArrayList<>(TypeResources.values().length);
            List<Long> consumption = new ArrayList<>(TypeResources.values().length);
            for (int j = 0; j < TypeResources.values().length; j++) {
                production.add(0L);
                consumption.add(0L);
            }
            for(Module module : modules){
                Component component = TypeModule.values()[module.getModule_type()].createModule(module);
                component.getProduction(i, modules, production);
                component.getConsumption(i, modules, consumption);
            }
            zoneProductions.add(new ZoneProduction(i, production, consumption));
        }

        return new Statistics(user.getCurrent_day(), successfulService.getSuccessful(idUser).successful(), count, sproduction, sconsumption, zoneProductions);
    }

    public Long create(UserIn userIn) {
        Optional<User> optionalUser = userRepository.findByEmail(userIn.email());
        if(optionalUser.isPresent()){
            throw new IllegalStateException("Пользователь уже есть");
        }
        User user = new User(null, userIn.name(), userIn.email(), userIn.password(), 0, 0, false);
        return userRepository.save(user).getId();
    }
}
