package bfg.backend.dto.responce.statistics;

import java.util.List;

public record ZoneProduction(Integer id,
                             List<Long> production,
                             List<Long> consumption) {}
