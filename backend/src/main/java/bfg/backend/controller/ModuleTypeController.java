package bfg.backend.controller;

import bfg.backend.dto.responce.AllModuleTypesResponse;
import bfg.backend.service.ModuleTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/module-types")
public class ModuleTypeController {

    private final ModuleTypeService moduleTypeService;

    @Autowired
    public ModuleTypeController(ModuleTypeService moduleTypeService) {
        this.moduleTypeService = moduleTypeService;
    }

    @GetMapping
    public AllModuleTypesResponse getAllModuleTypes() {
        return moduleTypeService.getAllModuleTypes();
    }
}