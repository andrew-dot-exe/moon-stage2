package bfg.backend.dto.responce.day;

import java.util.List;

public record ChangeDay(Boolean live,
                        List<Long> diffResources) {
}
