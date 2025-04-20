package bfg.backend.service;

import bfg.backend.dto.request.modulePlace.ModulePlace;
import bfg.backend.dto.responce.checkPlace.CheckedPlace;
import bfg.backend.repository.link.*;
import bfg.backend.repository.module.Module;
import bfg.backend.repository.module.ModuleRepository;
import bfg.backend.repository.resource.*;
import bfg.backend.repository.user.*;
import bfg.backend.service.logic.Component;
import bfg.backend.service.logic.TypeModule;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CheckPlaceService {

    private final UserRepository userRepository;
    private final LinkRepository linkRepository;
    private final ModuleRepository moduleRepository;
    private final ResourceRepository resourceRepository;

    public CheckPlaceService(UserRepository userRepository, LinkRepository linkRepository, ModuleRepository moduleRepository, ResourceRepository resourceRepository) {
        this.userRepository = userRepository;
        this.linkRepository = linkRepository;
        this.moduleRepository = moduleRepository;
        this.resourceRepository = resourceRepository;
    }

    public CheckedPlace check(ModulePlace modulePlace){
        // Validate modulePlace object
        if (modulePlace == null) {
            throw new IllegalArgumentException("Module place data cannot be null");
        }
        
        if (modulePlace.idUser() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        
        Optional<User> optionalUser = userRepository.findById(modulePlace.idUser());
        if(optionalUser.isEmpty()){
            throw new RuntimeException("Такого пользователя нет");
        }
        User user = optionalUser.get();
        // if(!user.getLive()){
        //     throw new RuntimeException("Данный пользоваель завершил колнизацию");
        // }

        // Validate other required parameters
        if (modulePlace.typeModule() == null) {
            throw new IllegalArgumentException("Module type cannot be null");
        }
        
        if (modulePlace.idZone() == null) {
            throw new IllegalArgumentException("Zone ID cannot be null");
        }
        
        if (modulePlace.x() == null || modulePlace.y() == null) {
            throw new IllegalArgumentException("Coordinates (x,y) cannot be null");
        }

        List<Module> modules = moduleRepository.findByIdUser(user.getId());
        List<Link> links = linkRepository.findByIdUser(user.getId());
        List<Resource> resources = resourceRepository.findByIdUser(user.getId());

        Component component = TypeModule.values()[modulePlace.typeModule()].
                createModule(user.getId(), modulePlace.idZone(), modulePlace.x(), modulePlace.y());

        Integer relief = component.getRelief();
        Integer rationality = component.getRationality(modules, links, resources);

        // Если нужно полное тестирование, можно использовать заглушку
        if (System.getProperty("USE_STUBS") != null && System.getProperty("USE_STUBS").equals("true")) {
            return CheckedPlace.stub();
        }

        // TODO: Реализовать получение реальной информации о ячейке
        // В реальной имплементации тут нужно добавить получение всех полей из сервисов
        
        // Заглушка для расширенных данных о ячейке
        String zoneName = "Зона " + modulePlace.idZone();
        Double height = 10.0 + (modulePlace.x() % 5) + (modulePlace.y() % 7) * 0.5; // Генерируем высоту на основе координат
        Double angle = 0.1 + (modulePlace.x() + modulePlace.y()) % 10 * 0.05; // Генерируем угол наклона
        Integer illumination = 30 + (modulePlace.idZone() * 10); // Разная освещенность по зонам
        
        // Генерируем лунные координаты как смещение от базовых точек
        Double baseLat = 25.0;
        Double baseLong = 45.0;
        Double lunarLatitude = baseLat + (modulePlace.x() * 0.01);
        Double lunarLongitude = baseLong + (modulePlace.y() * 0.01);
        
        // Определяем ровность области на основе значения угла наклона
        Boolean isFlatArea = angle < 0.3;

        // Возвращаем объект с полными данными
        return CheckedPlace.full(true, relief, rationality, height, angle, 
                          illumination, zoneName, lunarLatitude, lunarLongitude, isFlatArea);
    }
}
