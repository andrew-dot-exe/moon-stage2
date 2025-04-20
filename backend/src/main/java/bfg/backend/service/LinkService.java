package bfg.backend.service;

import bfg.backend.repository.link.Link;
import bfg.backend.repository.link.LinkRepository;
import bfg.backend.repository.resource.Resource;
import bfg.backend.repository.resource.ResourceRepository;
import bfg.backend.repository.user.User;
import bfg.backend.repository.user.UserRepository;
import bfg.backend.service.logic.TypeResources;
import bfg.backend.service.logic.zones.Zones;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LinkService {

    private final LinkRepository linkRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    public LinkService(LinkRepository linkRepository, UserRepository userRepository, ResourceRepository resourceRepository) {
        this.linkRepository = linkRepository;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
    }

    public void delete(Link link) {
        Optional<User> optionalUser = userRepository.findById(link.getPrimaryKey().getId_user());
        if(optionalUser.isEmpty()){
            throw new RuntimeException("Такого пользователя нет");
        }
        User user = optionalUser.get();
        if(!user.getLive()){
            throw new RuntimeException("Данный пользоваель завершил колнизацию");
        }
        //linkRepository.deleteById(new Link.PrimaryKey(type, idUser, idZone1, idZone2));
        if(linkRepository.findById(link.getPrimaryKey()).isEmpty()){
            throw new RuntimeException("Такой связи нет");
        }
        if(link.getPrimaryKey().getType() == 1){
            Optional<Resource> optionalResource = resourceRepository.findById(new Resource.PrimaryKey(TypeResources.WT.ordinal(), link.getPrimaryKey().getId_user()));
            if(optionalResource.isEmpty()){
                throw new RuntimeException("Такого ресурса нет (как так?)");
            }
            Resource wt = optionalResource.get();
            int way = Zones.getZones().get(link.getPrimaryKey().getId_zone1()).getWays()[link.getPrimaryKey().getId_zone2()];
            wt.setConsumption(wt.getConsumption() - way * 12L / 10000);
            resourceRepository.save(wt);
        }
        linkRepository.delete(link);

    }

    public Integer create(Link link) {
        Optional<User> optionalUser = userRepository.findById(link.getPrimaryKey().getId_user());
        if(optionalUser.isEmpty()){
            throw new RuntimeException("Такого пользователя нет");
        }
        User user = optionalUser.get();
        if(!user.getLive()){
            throw new RuntimeException("Данный пользоваель завершил колнизацию");
        }
        if(linkRepository.findById(link.getPrimaryKey()).isPresent()){
            throw new RuntimeException("Такая связь уже есть");
        }
        linkRepository.save(link);
        int way = Zones.getZones().get(link.getPrimaryKey().getId_zone1()).getWays()[link.getPrimaryKey().getId_zone2()];
        if(link.getPrimaryKey().getType() == 0) {
            Optional<Resource> optionalResource = resourceRepository.findById(new Resource.PrimaryKey(TypeResources.MATERIAL.ordinal(), link.getPrimaryKey().getId_user()));
            if(optionalResource.isEmpty()){
                throw new RuntimeException("Такого ресурса нет (как так?)");
            }
            Resource mat = optionalResource.get();
            mat.setCount(mat.getCount() - way);
            if(mat.getCount() < 0){
                user.setLive(false);
                userRepository.save(user);
            }
            resourceRepository.save(mat);
            return way;
        }
        Optional<Resource> optionalResource = resourceRepository.findById(new Resource.PrimaryKey(TypeResources.WT.ordinal(), link.getPrimaryKey().getId_user()));
        if(optionalResource.isEmpty()){
            throw new RuntimeException("Такого ресурса нет (как так?)");
        }
        Resource wt = optionalResource.get();
        wt.setConsumption(wt.getConsumption() + way * 12L / 10000);
        resourceRepository.save(wt);
        return 0;
    }
}
