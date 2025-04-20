package bfg.backend.repository.module;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Module implements Comparable<Module>{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long id_user;
    private Integer id_zone;
    private Integer module_type;
    private Integer x;
    private Integer y;

    public Module(Long id, Long id_user, Integer id_zone, Integer module_type, Integer x, Integer y) {
        this.id = id;
        this.id_user = id_user;
        this.id_zone = id_zone;
        this.module_type = module_type;
        this.x = x;
        this.y = y;
    }

    public Module() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId_user() {
        return id_user;
    }

    public void setId_user(Long id_user) {
        this.id_user = id_user;
    }

    public Integer getId_zone() {
        return id_zone;
    }

    public void setId_zone(Integer id_zone) {
        this.id_zone = id_zone;
    }

    public Integer getModule_type() {
        return module_type;
    }

    public void setModule_type(Integer module_type) {
        this.module_type = module_type;
    }

    public Integer getX() {
        return x;
    }

    public void setX(Integer x) {
        this.x = x;
    }

    public Integer getY() {
        return y;
    }

    public void setY(Integer y) {
        this.y = y;
    }

    @Override
    public int compareTo(Module o) {
        return id.compareTo(o.id);
    }
}
