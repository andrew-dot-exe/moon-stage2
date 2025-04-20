package bfg.backend.controller;

import bfg.backend.dto.responce.optimality.Optimality;
import bfg.backend.repository.module.Module;
import bfg.backend.service.ModuleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "module")
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @GetMapping(path = "{idUser}")
    public List<Optimality> optimality(@PathVariable Long idUser){
        return moduleService.getOptimality(idUser);
    }

    @DeleteMapping(path = "{idUser}")
    public void delete(@PathVariable Long idUser,
                       @RequestParam Long id){
        moduleService.delete(idUser, id);
    }

    @PostMapping
    public Integer create(@RequestBody Module module){
        return moduleService.create(module);
    }
}
