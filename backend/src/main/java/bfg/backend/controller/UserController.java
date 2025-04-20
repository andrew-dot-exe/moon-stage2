package bfg.backend.controller;

import bfg.backend.dto.request.user.UserIn;
import bfg.backend.dto.responce.allUserInfo.AllUserInfo;
import bfg.backend.dto.responce.statistics.Statistics;
import bfg.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "user")
public class UserController {

    private final UserService userService;

    public UserController(UserService findUserService) {
        this.userService = findUserService;
    }

    @GetMapping(path = "{id}")
    public Statistics statistics(@PathVariable Long id){
        return userService.getStatistics(id);
    }

    @PostMapping
    public AllUserInfo find(@RequestBody UserIn user){
        return userService.find(user);
    }

}
