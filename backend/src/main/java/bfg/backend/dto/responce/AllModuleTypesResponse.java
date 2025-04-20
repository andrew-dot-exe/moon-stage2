package bfg.backend.dto.responce;

import java.util.List;

public class AllModuleTypesResponse {
    private List<ModuleTypeDTO> moduleTypes;

    public AllModuleTypesResponse() {
    }

    public AllModuleTypesResponse(List<ModuleTypeDTO> moduleTypes) {
        this.moduleTypes = moduleTypes;
    }

    public List<ModuleTypeDTO> getModuleTypes() {
        return moduleTypes;
    }

    public void setModuleTypes(List<ModuleTypeDTO> moduleTypes) {
        this.moduleTypes = moduleTypes;
    }
}
