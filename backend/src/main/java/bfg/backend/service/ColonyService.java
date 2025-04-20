package bfg.backend.service;

import bfg.backend.dto.responce.allUserInfo.AllUserInfo;
import bfg.backend.mapping.MappingToResponse;
import bfg.backend.repository.link.Link;
import bfg.backend.repository.link.LinkRepository;
import bfg.backend.repository.module.Module;
import bfg.backend.repository.module.ModuleRepository;
import bfg.backend.repository.resource.Resource;
import bfg.backend.repository.resource.ResourceRepository;
import bfg.backend.repository.user.User;
import bfg.backend.repository.user.UserRepository;
import bfg.backend.service.logic.TypeResources;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static bfg.backend.service.logic.Constants.DAYS_DELIVERY;

@Service
public class ColonyService {

    private final UserRepository userRepository;
    private final LinkRepository linkRepository;
    private final ModuleRepository moduleRepository;
    private final ResourceRepository resourceRepository;

    public ColonyService(UserRepository userRepository, LinkRepository linkRepository, ModuleRepository moduleRepository, ResourceRepository resourceRepository) {
        this.userRepository = userRepository;
        this.linkRepository = linkRepository;
        this.moduleRepository = moduleRepository;
        this.resourceRepository = resourceRepository;
    }

    public void delete(Long idUser){
        Optional<User> optionalUser = userRepository.findById(idUser);
        if(optionalUser.isEmpty()){
            throw new RuntimeException("Такого пользователя нет");
        }
        User user = optionalUser.get();

        List<Link> links = linkRepository.findByIdUser(idUser);
        List<Module> modules = moduleRepository.findByIdUser(idUser);
        List<Resource> resources = resourceRepository.findByIdUser(idUser);

        linkRepository.deleteAll(links);
        moduleRepository.deleteAll(modules);
        resourceRepository.deleteAll(resources);

        user.setLive(false);
        userRepository.save(user);
    }

    public AllUserInfo create(Long idUser){
        Optional<User> optionalUser = userRepository.findById(idUser);
        if(optionalUser.isEmpty()){
            throw new RuntimeException("Такого пользователя нет");
        }
        User user = optionalUser.get();
        if(user.getLive()){
            throw new RuntimeException("У пользователя уже есть колония");
        }

        user.setLive(true);
        user.setCurrent_day(0);
        user.setDays_before_delivery(DAYS_DELIVERY);

        List<Resource> resources = new ArrayList<>();
        for (int i = 0; i < TypeResources.values().length; i++) {
            resources.add(new Resource(new Resource.PrimaryKey(i, idUser), TypeResources.values()[i].getStartCount(), 0L, 0L, 0L, 0L));
        }
        resourceRepository.saveAll(resources);

        List<Module> modules = moduleRepository.findByIdUser(user.getId());
        List<Link> links = linkRepository.findByIdUser(user.getId());

        return MappingToResponse.mapToAllUserInfo(user, modules, links, resources);
    }
}
