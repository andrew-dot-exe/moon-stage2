package bfg.backend.dto.responce.allUserInfo;

public class Module {
    private Long id;
    private Integer idZone;
    private Integer moduleType;
    private Integer x;
    private Integer y;

    public Module(Long id, Integer id_zone, Integer module_type, Integer x, Integer y) {
        this.id = id;
        this.idZone = id_zone;
        this.moduleType = module_type;
        this.x = x;
        this.y = y;
    }

    public Module() {}

    public Module(bfg.backend.repository.module.Module module){
        id = module.getId();
        idZone = module.getId_zone();
        moduleType = module.getModule_type();
        x = module.getX();
        y = module.getY();
    }

    public Integer getIdZone() {
        return idZone;
    }

    public void setIdZone(Integer idZone) {
        this.idZone = idZone;
    }

    public Integer getModuleType() {
        return moduleType;
    }

    public void setModuleType(Integer moduleType) {
        this.moduleType = moduleType;
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
