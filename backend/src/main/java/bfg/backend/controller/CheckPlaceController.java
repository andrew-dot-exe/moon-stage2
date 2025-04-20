package bfg.backend.controller;


import bfg.backend.dto.request.modulePlace.ModulePlace;
import bfg.backend.dto.responce.checkPlace.CheckedPlace;
import bfg.backend.service.CheckPlaceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "check")
public class CheckPlaceController {

    private final CheckPlaceService checkPlaceService;

    public CheckPlaceController(CheckPlaceService checkPlaceService) {
        this.checkPlaceService = checkPlaceService;
    }

    @PostMapping
    public CheckedPlace checkPlace(@RequestBody ModulePlace modulePlace){
        return checkPlaceService.check(modulePlace);
    }
}
