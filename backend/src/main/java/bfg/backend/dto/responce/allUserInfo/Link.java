package bfg.backend.dto.responce.allUserInfo;

public class Link {
    private Integer type;
    private Integer idZone1;
    private Integer idZone2;

    public Link(Integer type, Integer id_zone1, Integer id_zone2) {
        this.type = type;
        this.idZone1 = id_zone1;
        this.idZone2 = id_zone2;
    }

    public Link() {}

    public Link(bfg.backend.repository.link.Link link){
        type = link.getPrimaryKey().getType();
        idZone1 = link.getPrimaryKey().getId_zone1();
        idZone2 = link.getPrimaryKey().getId_zone2();
    }

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
    }

    public Integer getIdZone1() {
        return idZone1;
    }

    public void setIdZone1(Integer idZone1) {
        this.idZone1 = idZone1;
    }

    public Integer getIdZone2() {
        return idZone2;
    }

    public void setIdZone2(Integer idZone2) {
        this.idZone2 = idZone2;
    }
}
