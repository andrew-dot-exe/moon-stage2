package bfg.backend.repository.module;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    @Query(value = "select * from module where id_user = :id_user", nativeQuery = true)
    List<Module> findByIdUser(Long id_user);
}
