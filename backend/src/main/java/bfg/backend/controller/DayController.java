package bfg.backend.controller;


import bfg.backend.dto.responce.day.ChangeDay;
import bfg.backend.service.DayService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "day")
public class DayController {

    private final DayService dayService;

    public DayController(DayService dayService) {
        this.dayService = dayService;
    }

    @GetMapping(path = "{idUser}")
    public ChangeDay addDay(@PathVariable Long idUser){
        return dayService.addDay(idUser);
    }
}
