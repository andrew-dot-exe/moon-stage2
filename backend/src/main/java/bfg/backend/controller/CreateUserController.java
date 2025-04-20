package bfg.backend.controller;

import bfg.backend.dto.request.user.UserIn;
import bfg.backend.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "userCreate")
public class CreateUserController {

    private final UserService userService;

    public CreateUserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public Long create(@RequestBody UserIn user){
        return userService.create(user);
    }
}
