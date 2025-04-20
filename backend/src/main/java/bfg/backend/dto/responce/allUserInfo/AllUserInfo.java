package bfg.backend.dto.responce.allUserInfo;

import java.util.List;

public record AllUserInfo(String name,
                          Long id,
                          Integer curDay,
                          Integer dayBeforeDelivery,
                          Boolean live,
                          List<Resource> resources,
                          List<Link> links,
                          List<Module> modules) {}
 //при входе в игру и при изменении дня 