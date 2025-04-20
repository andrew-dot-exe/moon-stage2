package bfg.backend.dto.responce.areaInfo;

import bfg.backend.service.logic.zones.Area;

import java.util.List;

public record AreaInfo(List<Area> zones) {
}
