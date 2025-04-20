package bfg.backend.controller;


import bfg.backend.repository.link.Link;
import bfg.backend.service.LinkService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "link")
public class LinkController {

    private final LinkService linkService;

    public LinkController(LinkService linkService) {
        this.linkService = linkService;
    }

    @DeleteMapping
    public void delete(@RequestParam Link link){
        linkService.delete(link);
    }

    @PostMapping
    public Integer create(@RequestBody Link link){
        return linkService.create(link);
    }
}
