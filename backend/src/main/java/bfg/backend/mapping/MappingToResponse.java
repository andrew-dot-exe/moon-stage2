package bfg.backend.mapping;

import bfg.backend.dto.responce.allUserInfo.*;
import bfg.backend.repository.link.Link;
import bfg.backend.repository.module.Module;
import bfg.backend.repository.user.User;
import bfg.backend.repository.resource.Resource;

import java.util.LinkedList;
import java.util.List;

public class MappingToResponse {

    public static AllUserInfo mapToAllUserInfo(User user, List<Module> modules, List<Link> links, List<Resource> resources){
        List<bfg.backend.dto.responce.allUserInfo.Module> resMod = new LinkedList<>();
        List<bfg.backend.dto.responce.allUserInfo.Link> resLink = new LinkedList<>();
        List<bfg.backend.dto.responce.allUserInfo.Resource> resResource = new LinkedList<>();

        for(Module module : modules){
            resMod.add(new bfg.backend.dto.responce.allUserInfo.Module(module));
        }
        for (Resource resource : resources){
            resResource.add(new bfg.backend.dto.responce.allUserInfo.Resource(resource));
        }
        for (Link link : links){
            resLink.add(new bfg.backend.dto.responce.allUserInfo.Link(link));
        }

        return new AllUserInfo(user.getName(), user.getId(), user.getCurrent_day(), user.getDays_before_delivery(), user.getLive(), resResource, resLink, resMod);
    }
}
