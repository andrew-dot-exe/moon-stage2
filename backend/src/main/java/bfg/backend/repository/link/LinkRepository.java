package bfg.backend.repository.link;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LinkRepository extends JpaRepository<Link, Link.PrimaryKey> {
    @Query(value = "select * from link where id_user = :id_user", nativeQuery = true)
    List<Link> findByIdUser(Long id_user);
}
