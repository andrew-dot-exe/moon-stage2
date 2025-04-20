package bfg.backend.dto.responce.statistics;

import java.util.List;

public record Statistics(Integer countDay,
                         Integer successful,
                         List<Long> countResources,
                         List<Long> sumProduction,
                         List<Long> sumConsumption,
                         List<ZoneProduction> zoneProductions) {
}
