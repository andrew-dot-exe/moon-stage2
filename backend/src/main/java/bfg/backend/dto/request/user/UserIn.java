package bfg.backend.dto.request.user;

public record UserIn(String name,
                     String email,
                     String password) {
}
