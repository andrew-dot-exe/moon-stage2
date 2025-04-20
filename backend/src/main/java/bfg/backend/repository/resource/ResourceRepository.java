package bfg.backend.repository.resource;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Resource.PrimaryKey> {
    @Query(value = "select * from resource where id_user = :id_user", nativeQuery = true)
    List<Resource> findByIdUser(Long id_user);
}
