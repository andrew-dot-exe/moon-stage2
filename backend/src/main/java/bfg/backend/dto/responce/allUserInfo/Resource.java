package bfg.backend.dto.responce.allUserInfo;

public class Resource {
    private Integer type;
    private Long count;
    private Long production;

    public Resource(Integer type, Long count, Long production) {
        this.type = type;
        this.count = count;
        this.production = production;
    }

    public Resource() {}

    public Resource(bfg.backend.repository.resource.Resource resource){
        type = resource.getPrimaryKey().getResource_type();
        count = resource.getCount();
        production = resource.getProduction();
    }

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }

    public Long getProduction() {
        return production;
    }

    public void setProduction(Long production) {
        this.production = production;
    }
}
