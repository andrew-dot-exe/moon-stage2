package bfg.backend.service;

import bfg.backend.dto.responce.AllModuleTypesResponse;
import bfg.backend.dto.responce.ModuleTypeDTO;
import bfg.backend.service.logic.TypeModule;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ModuleTypeService {

    public AllModuleTypesResponse getAllModuleTypes() {
        List<ModuleTypeDTO> moduleTypes = new ArrayList<>();
        
        for (TypeModule typeModule : TypeModule.values()) {
            ModuleTypeDTO dto = new ModuleTypeDTO(
                    typeModule.ordinal(),
                    typeModule.name(),
                    typeModule.getPeople(),
                    typeModule.getCost(),
                    typeModule.isLive()
            );
            moduleTypes.add(dto);
        }
        
        return new AllModuleTypesResponse(moduleTypes);
    }
}