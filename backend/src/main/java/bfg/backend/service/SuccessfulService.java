package bfg.backend.service;

import bfg.backend.dto.responce.successful.Successful;
import bfg.backend.repository.module.Module;
import bfg.backend.repository.module.ModuleRepository;
import bfg.backend.repository.resource.Resource;
import bfg.backend.repository.resource.ResourceRepository;
import bfg.backend.repository.user.User;
import bfg.backend.repository.user.UserRepository;
import bfg.backend.service.logic.TypeModule;
import bfg.backend.service.logic.TypeResources;
import bfg.backend.service.logic.zones.Zones;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static bfg.backend.service.logic.Constants.DAYS_DELIVERY;
import static bfg.backend.service.logic.Constants.MASS;

@Service
public class SuccessfulService {

    private final UserRepository userRepository;
    private final ModuleRepository moduleRepository;
    private final ResourceRepository resourceRepository;

    public SuccessfulService(UserRepository userRepository, ModuleRepository moduleRepository, ResourceRepository resourceRepository) {
        this.userRepository = userRepository;
        this.moduleRepository = moduleRepository;
        this.resourceRepository = resourceRepository;
    }

    public Successful getSuccessful(Long idUser){
        Optional<User> optionalUser = userRepository.findById(idUser);
        if(optionalUser.isEmpty()){
            throw new RuntimeException("Такого пользователя нет");
        }
        User user = optionalUser.get();

        List<Module> modules = moduleRepository.findByIdUser(user.getId());
        modules.sort(Module::compareTo);
        List<Resource> resources = resourceRepository.findByIdUser(user.getId());
        resources.sort(Resource::compareTo);

        int successful = 0;
        int mood = 0;
        int countPeople = 0;
        int needCountPeople = 0;
        int statResources = 0;
        int central = 0;
        int search = 0;

        long sumDiff = 0L;
        for(Resource resource : resources){
            long diff = resource.getProduction() - resource.getConsumption();
            if(diff < 0) sumDiff -= diff;
        }
        statResources = Math.toIntExact(100 - (sumDiff * DAYS_DELIVERY) / MASS * 100);

        int countA = 0;
        int pSearch = 0;
        int mSearch = 0;
        int lSearch = 0;
        int aSearch = 0;
        int countM = 0;
        int countS = 0;

        countPeople = Math.toIntExact(modules.stream().filter(e -> e.getModule_type() == TypeModule.LIVE_MODULE_Y.ordinal() ||
                e.getModule_type() == TypeModule.LIVE_MODULE_X.ordinal()).count()) * 8;

        for (Module module : modules){
            switch (TypeModule.values()[module.getModule_type()]){
                case ADMINISTRATIVE_MODULE:
                case LIVE_ADMINISTRATIVE_MODULE:
                    if(needCountPeople >= countPeople) break;
                    countA++;
                    break;

                case RESEARCH_MODULE_MINE:
                    if(needCountPeople >= countPeople) break;
                    mSearch = 1;
                    break;
                case RESEARCH_MODULE_PLANTATION:
                    if(needCountPeople >= countPeople) break;
                    pSearch = 1;
                    break;
                case RESEARCH_MODULE_TELESCOPE:
                    if(needCountPeople >= countPeople) break;
                    aSearch = 1;
                    break;
                case RESEARCH_MODULE_TERRITORY:
                    if(needCountPeople >= countPeople) break;
                    lSearch = 1;
                    break;

                case MEDICAL_MODULE:
                    countM++;
                    break;

                case SPORT_MODULE:
                    countS++;
                    break;
            }
            needCountPeople += TypeModule.values()[module.getModule_type()].getPeople();
        }

        if(countPeople != 0) {
            mood = (int) (Math.min((countM + countS) * 3 * 8 / countPeople * 25, 50) +
                    (statResources +
                            Math.min(resources.get(TypeResources.FOOD.ordinal()).getProduction() /
                                    (resources.get(TypeResources.FOOD.ordinal()).getConsumption() * 0.3), 100)) / 4);
        }
        central = Math.min(countA / Zones.getLength() * 100, 100);
        search = Math.min((pSearch + mSearch + lSearch + aSearch) * 25, 100);
        successful = (int) (mood * 0.19 + (100 - Math.max(needCountPeople - countPeople, 0) * 15) * 0.21 + statResources * 0.21 +
                        central * 0.21 + search * 0.18);
        return new Successful(successful, mood, countPeople, needCountPeople, statResources, central, search);
    }
}
