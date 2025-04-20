package bfg.backend.dto.request.modulePlace;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ModulePlace(
        @JsonProperty("id_user") Long idUser,
        @JsonProperty("module_type") Integer typeModule,
        Integer x,
        Integer y,
        @JsonProperty("id_zone") Integer idZone) {}
